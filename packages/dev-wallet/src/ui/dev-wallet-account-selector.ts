// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

import type { ReadonlyWalletAccount } from '@mysten/wallet-standard';
import { css, html, LitElement, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

import type { SignerAdapter } from '../types.js';
import { CopyController } from './copy-controller.js';
import { dropdownItemStyles, sharedStyles } from './styles.js';
import { emitEvent, findAdapterForAddress, formatAddress } from './utils.js';
import './dev-wallet-dropdown.js';

const ADAPTER_SHORT_NAMES: Record<string, string> = {
	'WebCrypto Signer': 'WebCrypto',
	'Remote CLI Signer': 'CLI',
	'In-Memory Signer': 'Memory',
	'Passkey Signer': 'Passkey',
};

@customElement('dev-wallet-account-selector')
export class DevWalletAccountSelector extends LitElement {
	static override styles = [
		sharedStyles,
		dropdownItemStyles,
		css`
			:host {
				display: block;
			}

			/* -- Hero trigger (centered name + address + copy) -------------- */

			.hero {
				display: flex;
				flex-direction: column;
				align-items: center;
				padding: 8px 0 4px;
			}

			.hero-name-row {
				display: flex;
				align-items: center;
				gap: 4px;
				cursor: pointer;
				padding: 4px 8px;
				border-radius: var(--dev-wallet-radius-sm);
			}

			.hero-name-row:hover {
				background: var(--dev-wallet-hover);
			}

			.hero-name {
				font-size: 16px;
				font-weight: var(--dev-wallet-font-weight-semibold);
				color: var(--dev-wallet-foreground);
			}

			.hero-chevron {
				width: 14px;
				height: 14px;
				color: var(--dev-wallet-tertiary);
			}

			.hero-address-row {
				display: flex;
				align-items: center;
				gap: 6px;
				margin-top: 2px;
			}

			.hero-address {
				font-size: 13px;
				font-family: var(--dev-wallet-font-mono);
				color: var(--dev-wallet-muted-foreground);
			}

			.hero-copy {
				width: 26px;
				height: 26px;
				display: flex;
				align-items: center;
				justify-content: center;
				border-radius: var(--dev-wallet-radius-xs);
				color: var(--dev-wallet-tertiary);
			}

			.hero-copy svg {
				width: 14px;
				height: 14px;
			}

			.hero-copy:hover {
				color: var(--dev-wallet-foreground);
			}

			.hero-copy.copied {
				color: var(--dev-wallet-positive);
			}

			/* -- Dropdown items --------------------------------------------- */

			.dropdown-item .item-avatar {
				width: 28px;
				height: 28px;
				border-radius: 50%;
				display: flex;
				align-items: center;
				justify-content: center;
				font-size: 11px;
				font-weight: var(--dev-wallet-font-weight-medium);
				color: var(--dev-wallet-muted-foreground);
				background: var(--dev-wallet-active);
				flex-shrink: 0;
			}

			.dropdown-item[aria-selected='true'] .item-avatar {
				background: var(--dev-wallet-primary);
				color: var(--dev-wallet-primary-foreground);
			}

			.dropdown-item[aria-selected='true'] {
				background: var(--dev-wallet-hover);
			}

			.item-info {
				flex: 1;
				min-width: 0;
			}

			.item-label {
				font-size: 13px;
				font-weight: var(--dev-wallet-font-weight-medium);
				color: var(--dev-wallet-foreground);
				overflow: hidden;
				text-overflow: ellipsis;
				white-space: nowrap;
			}

			.item-address {
				font-size: 11px;
				font-family: var(--dev-wallet-font-mono);
				color: var(--dev-wallet-tertiary);
			}

			.item-badge {
				font-size: 9px;
				padding: 2px 6px;
				border-radius: 999px;
				background: var(--dev-wallet-hover);
				color: var(--dev-wallet-tertiary);
				white-space: nowrap;
			}

			.selector-wrapper {
				--dropdown-max-height: 260px;
			}

			.empty-state {
				padding: 20px;
				text-align: center;
				font-size: 13px;
				color: var(--dev-wallet-muted-foreground);
			}
		`,
	];

	@property({ attribute: false })
	accounts: ReadonlyWalletAccount[] = [];

	@property({ attribute: false })
	adapters: SignerAdapter[] = [];

	@property({ type: String })
	activeAddress = '';

	@state()
	private _open = false;

	#copy = new CopyController(this);

	override render() {
		const active = this.accounts.find((a) => a.address === this.activeAddress);

		if (!active) {
			return html`<div class="empty-state" part="empty-state">No account selected</div>`;
		}

		const label = this.#getLabel(active);

		return html`
			<div class="hero">
				<dev-wallet-dropdown
					class="selector-wrapper"
					.open=${this._open}
					@close=${() => (this._open = false)}
				>
					<button
						slot="trigger"
						class="hero-name-row"
						part="trigger"
						aria-expanded=${this._open}
						aria-haspopup="listbox"
						@click=${() => (this._open = !this._open)}
					>
						<span class="hero-name">${label}</span>
						<svg
							class="hero-chevron"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2.5"
						>
							<path d="M6 9l6 6 6-6" />
						</svg>
					</button>
					<div slot="popover" role="listbox" aria-label="Select account">
						${this.accounts.map((account) => {
							const accountLabel = this.#getLabel(account);
							const accountInitial = (accountLabel[0] ?? '?').toUpperCase();
							const adapterName = this.#getAdapterName(account.address);

							return html`
								<button
									class="dropdown-item"
									role="option"
									aria-selected=${account.address === this.activeAddress}
									@click=${() => this.#select(account)}
								>
									<span class="item-avatar">${accountInitial}</span>
									<div class="item-info">
										<div class="item-label">${accountLabel}</div>
										<div class="item-address">${formatAddress(account.address)}</div>
									</div>
									${adapterName ? html`<span class="item-badge">${adapterName}</span>` : nothing}
								</button>
							`;
						})}
					</div>
				</dev-wallet-dropdown>
				<div class="hero-address-row">
					<span class="hero-address">${formatAddress(active.address)}</span>
					<button
						class="hero-copy ${this.#copy.isCopied(active.address) ? 'copied' : ''}"
						part="copy-button"
						title="Copy address"
						aria-label="Copy address"
						@click=${() => this.#copy.copy(active.address)}
					>
						${this.#copy.isCopied(active.address)
							? html`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 6L9 17l-5-5"/></svg>`
							: html`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>`}
					</button>
				</div>
			</div>
		`;
	}

	#getLabel(account: ReadonlyWalletAccount): string {
		return account.label ?? `Account ${account.address.slice(0, 8)}`;
	}

	#getAdapterName(address: string): string | null {
		const adapter = findAdapterForAddress(this.adapters, address);
		if (!adapter) return null;
		return ADAPTER_SHORT_NAMES[adapter.name] ?? adapter.name;
	}

	#select(account: ReadonlyWalletAccount) {
		this._open = false;
		emitEvent(this, 'account-selected', { account });
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'dev-wallet-account-selector': DevWalletAccountSelector;
	}
}
