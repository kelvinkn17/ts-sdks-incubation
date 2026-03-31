// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

import { css, html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';

import type { DevWallet } from '../wallet/dev-wallet.js';
import {
	actionBarStyles,
	balanceDetailStyles,
	connectDialogStyles,
	sharedStyles,
	themeVars,
} from './styles.js';
import { WalletController } from './wallet-controller.js';

@customElement('dev-wallet-standalone')
export class DevWalletStandalone extends LitElement {
	static override styles = [
		sharedStyles,
		themeVars,
		connectDialogStyles,
		actionBarStyles,
		balanceDetailStyles,
		css`
			:host {
				display: flex;
				justify-content: center;
				padding: 24px 16px;
				min-height: 100vh;
				box-sizing: border-box;
			}

			.card {
				width: 100%;
				max-width: 480px;
				border-radius: var(--dev-wallet-radius-xl);
				background: var(--dev-wallet-background);
				box-shadow: var(--dev-wallet-shadow-lg);
				overflow: hidden;
				display: flex;
				flex-direction: column;
				height: min(640px, calc(100vh - 48px));
			}

			.card-header {
				display: flex;
				align-items: center;
				padding: 14px 16px;
				border-bottom: 1px solid var(--dev-wallet-border);
				gap: 10px;
			}

			.card-title {
				font-size: 14px;
				font-weight: var(--dev-wallet-font-weight-semibold);
				color: var(--dev-wallet-foreground);
			}

			.header-right {
				display: flex;
				align-items: center;
				gap: 8px;
				margin-left: auto;
			}

			.card-body {
				padding: 16px 20px;
				overflow-y: auto;
				flex: 1;
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

	/** When set, the settings tab shows a bookmarklet section pointing to this origin. */
	@property({ type: String })
	bookmarkletOrigin = '';

	#ctrl = new WalletController(this);
	#mediaQuery: MediaQueryList | null = null;

	override connectedCallback() {
		super.connectedCallback();
		this.#applyTheme();
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
		if (changedProperties.has('bookmarkletOrigin')) {
			this.#ctrl.bookmarkletOrigin = this.bookmarkletOrigin;
		}
	}

	override updated() {
		const dialog = this.shadowRoot?.querySelector<HTMLDialogElement>('.connect-dialog');
		if (this.#ctrl.pendingConnect && dialog && !dialog.open) {
			dialog.showModal();
		} else if (!this.#ctrl.pendingConnect && dialog?.open) {
			dialog.close();
		}
	}

	#onSettingChanged = (e: Event) => {
		const detail = (e as CustomEvent).detail;
		if (detail?.key === 'theme') this.#applyTheme();
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

	override render() {
		return html`
			<div class="card" part="card">
				<div class="card-header">
					<span class="card-title">${this.wallet?.name ?? 'Dev Wallet'}</span>
					<div class="header-right">
						${this.#ctrl.renderNetworkBadge()}
					</div>
				</div>
				<div class="card-body">${this.#ctrl.renderTabContent()}</div>
				${this.#ctrl.renderTabBar()}
			</div>
			${this.#ctrl.renderSigningModal()} ${this.#ctrl.renderConnectPicker()}
		`;
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'dev-wallet-standalone': DevWalletStandalone;
	}
}
