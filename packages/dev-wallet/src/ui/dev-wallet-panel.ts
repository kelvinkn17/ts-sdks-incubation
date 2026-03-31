// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

import { css, html, LitElement, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

import type { DevWallet } from '../wallet/dev-wallet.js';
import {
	actionBarStyles,
	balanceDetailStyles,
	connectDialogStyles,
	sharedStyles,
	themeVars,
} from './styles.js';
import { WalletController } from './wallet-controller.js';

@customElement('dev-wallet-panel')
export class DevWalletPanel extends LitElement {
	static override styles = [
		sharedStyles,
		themeVars,
		connectDialogStyles,
		actionBarStyles,
		balanceDetailStyles,
		css`
			:host {
				display: block;
				position: fixed;
				bottom: 16px;
				right: 16px;
				z-index: 999999;
				font-size: 14px;
			}

			.trigger {
				width: 48px;
				height: 48px;
				border-radius: 50%;
				background: var(--dev-wallet-primary);
				color: var(--dev-wallet-primary-foreground);
				display: flex;
				align-items: center;
				justify-content: center;
				box-shadow: var(--dev-wallet-shadow-md);
				transition: transform 0.15s;
				position: relative;
			}

			.trigger:hover {
				transform: scale(1.05);
			}

			.trigger svg {
				width: 24px;
				height: 24px;
			}

			.sidebar {
				position: absolute;
				bottom: 56px;
				right: 0;
				width: 360px;
				max-width: calc(100vw - 32px);
				max-height: 520px;
				border-radius: var(--dev-wallet-radius-xl);
				background: var(--dev-wallet-background);
				box-shadow: var(--dev-wallet-shadow-lg);
				display: flex;
				flex-direction: column;
			}

			.sidebar-header {
				display: flex;
				align-items: center;
				padding: 14px 16px;
				border-bottom: 1px solid var(--dev-wallet-border);
				position: relative;
				z-index: 1;
				gap: 10px;
			}

			.sidebar-title {
				font-size: 14px;
				font-weight: var(--dev-wallet-font-weight-semibold);
				color: var(--dev-wallet-foreground);
			}

			.header-spacer {
				flex: 1;
			}

			.close-btn {
				width: 28px;
				height: 28px;
				display: flex;
				align-items: center;
				justify-content: center;
				border-radius: var(--dev-wallet-radius-xs);
				flex-shrink: 0;
				color: var(--dev-wallet-muted-foreground);
			}

			.close-btn svg {
				width: 16px;
				height: 16px;
			}

			.close-btn:hover {
				color: var(--dev-wallet-foreground);
				background: var(--dev-wallet-hover);
			}

			.sidebar-body {
				padding: 16px;
				overflow-y: auto;
				overflow-x: hidden;
				flex: 1;
				min-height: 0;
			}

			.section {
				margin-bottom: 16px;
			}

			.section:last-child {
				margin-bottom: 0;
			}
		`,
	];

	@property({ attribute: false })
	wallet: DevWallet | null = null;

	@state()
	private _isOpen = false;

	#ctrl = new WalletController(this);
	#hadPendingRequest = false;
	#mediaQuery: MediaQueryList | null = null;

	override connectedCallback() {
		super.connectedCallback();
		this.#applyTheme();
		this.#applyPanelState();
		this.addEventListener('setting-changed', this.#onSettingChanged as EventListener);
	}

	override disconnectedCallback() {
		super.disconnectedCallback();
		this.removeEventListener('setting-changed', this.#onSettingChanged as EventListener);
		this.#mediaQuery?.removeEventListener('change', this.#onSystemThemeChange);
	}

	override willUpdate(changedProperties: Map<string, unknown>) {
		if (changedProperties.has('wallet')) {
			this.#ctrl.wallet = this.wallet;
		}
	}

	override updated() {
		// Refresh balances only when transitioning from having a pending request to not
		const hasPending = this.#ctrl.pendingRequest !== null;
		if (this.#hadPendingRequest && !hasPending) {
			this.updateComplete.then(() => {
				this.shadowRoot
					?.querySelector<
						import('./dev-wallet-balances.js').DevWalletBalances
					>('dev-wallet-balances')
					?.refresh();
			});
		}
		this.#hadPendingRequest = hasPending;

		const dialog = this.shadowRoot?.querySelector<HTMLDialogElement>('.connect-dialog');
		if (this.#ctrl.pendingConnect && dialog && !dialog.open) {
			dialog.showModal();
		} else if (!this.#ctrl.pendingConnect && dialog?.open) {
			dialog.close();
		}
	}

	override render() {
		return html`
			${this._isOpen ? this.#renderSidebar() : nothing}
			<button
				class="trigger"
				part="trigger"
				aria-label="Open Dev Wallet"
				@click=${this.#togglePanel}
			>
				${this.#walletIcon}
			</button>
			${this.#ctrl.renderSigningModal()} ${this.#ctrl.renderConnectPicker()}
		`;
	}

	#renderSidebar() {
		return html`
			<div class="sidebar" part="sidebar">
				<div class="sidebar-header">
					<span class="sidebar-title">${this.wallet?.name ?? 'Dev Wallet'}</span>
					${this.#ctrl.renderNetworkBadge()}
					<span class="header-spacer"></span>
					<button
						class="close-btn"
						part="close-button"
						aria-label="Close"
						@click=${this.#togglePanel}
					>
						<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
					</button>
				</div>
				<div class="sidebar-body">${this.#ctrl.renderTabContent()}</div>
				${this.#ctrl.renderTabBar()}
			</div>
		`;
	}

	get #walletIcon() {
		return html`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
			<rect x="2" y="6" width="20" height="14" rx="2.5" />
			<path d="M2 10h20" />
			<rect x="15" y="12" width="5" height="4" rx="1" />
			<circle cx="17.5" cy="14" r="0.5" fill="currentColor" stroke="none" />
		</svg>`;
	}

	#togglePanel() {
		this._isOpen = !this._isOpen;
		if (this._isOpen) {
			this.#ctrl.syncState();
		}
		// Persist state if preference is 'remember'
		try {
			if (localStorage.getItem('dev-wallet:panel-state') === 'remember') {
				localStorage.setItem('dev-wallet:panel-last-state', this._isOpen ? 'open' : 'closed');
			}
		} catch {
			// ignore
		}
	}

	#onSettingChanged = (e: Event) => {
		const detail = (e as CustomEvent).detail;
		if (detail?.key === 'theme') this.#applyTheme();
		if (detail?.key === 'panel-state') this.#applyPanelState();
	};

	#onSystemThemeChange = () => {
		this.#applyTheme();
	};

	#applyTheme() {
		let pref: string | null = null;
		try {
			pref = localStorage.getItem('dev-wallet:theme');
		} catch {
			// ignore
		}

		this.#mediaQuery?.removeEventListener('change', this.#onSystemThemeChange);

		if (pref === 'light') {
			this.setAttribute('theme', 'light');
		} else if (pref === 'system') {
			this.#mediaQuery = window.matchMedia('(prefers-color-scheme: light)');
			this.#mediaQuery.addEventListener('change', this.#onSystemThemeChange);
			this.setAttribute('theme', this.#mediaQuery.matches ? 'light' : 'dark');
		} else {
			this.removeAttribute('theme');
		}
	}

	#applyPanelState() {
		try {
			const pref = localStorage.getItem('dev-wallet:panel-state');
			if (pref === 'open') {
				this._isOpen = true;
			} else if (pref === 'closed') {
				this._isOpen = false;
			} else if (pref === 'remember') {
				this._isOpen = localStorage.getItem('dev-wallet:panel-last-state') !== 'closed';
			}
			// default (null) = open
		} catch {
			// ignore
		}
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'dev-wallet-panel': DevWalletPanel;
	}
}
