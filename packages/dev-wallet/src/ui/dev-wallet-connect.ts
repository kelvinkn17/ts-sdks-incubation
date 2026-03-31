// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

import { css, html, LitElement, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

import { actionButtonStyles, sharedStyles } from './styles.js';
import { emitEvent, formatAddress, toggleSetItem } from './utils.js';

interface AccountInfo {
	address: string;
	label?: string;
	adapterName?: string;
}

@customElement('dev-wallet-connect')
export class DevWalletConnect extends LitElement {
	static override styles = [
		sharedStyles,
		actionButtonStyles,
		css`
			:host {
				display: flex;
				flex-direction: column;
				min-height: 0;
			}

			.connect-content {
				flex: 1;
				padding: 20px;
			}

			.connect-header {
				margin-bottom: 16px;
			}

			.connect-title {
				font-size: 16px;
				font-weight: var(--dev-wallet-font-weight-semibold);
				color: var(--dev-wallet-foreground);
			}

			.connect-desc {
				font-size: 13px;
				color: var(--dev-wallet-muted-foreground);
				margin-top: 4px;
			}

			.app-info {
				margin-top: 12px;
				padding: 12px 14px;
				border-radius: var(--dev-wallet-radius);
				background: var(--dev-wallet-secondary);
			}

			.app-name {
				font-size: 14px;
				font-weight: var(--dev-wallet-font-weight-medium);
				color: var(--dev-wallet-foreground);
				display: block;
			}

			.app-url {
				font-size: 12px;
				color: var(--dev-wallet-tertiary);
				word-break: break-all;
				margin-top: 2px;
				display: block;
			}

			.account-list {
				max-height: 280px;
				overflow-y: auto;
			}

			.account-item {
				display: flex;
				align-items: center;
				gap: 12px;
				padding: 14px 0;
				border-bottom: 1px solid var(--dev-wallet-border);
				cursor: pointer;
			}

			.account-item:last-child {
				border-bottom: none;
			}

			.account-item:hover {
				background: transparent;
			}

			.account-item input[type='checkbox'] {
				width: 18px;
				height: 18px;
				accent-color: var(--dev-wallet-primary);
				flex-shrink: 0;
			}

			.account-label {
				font-size: 14px;
				font-weight: var(--dev-wallet-font-weight-medium);
				color: var(--dev-wallet-foreground);
			}

			.account-address {
				font-size: 12px;
				font-family: var(--dev-wallet-font-mono);
				color: var(--dev-wallet-tertiary);
			}

			.account-adapter {
				display: inline-block;
				font-size: 10px;
				font-weight: var(--dev-wallet-font-weight-medium);
				text-transform: uppercase;
				letter-spacing: 0.04em;
				padding: 2px 8px;
				border-radius: 999px;
				background: rgba(255, 255, 255, 0.06);
				color: var(--dev-wallet-tertiary);
				margin-left: 6px;
			}

			.connect-footer {
				padding: 16px 20px;
				border-top: 1px solid var(--dev-wallet-border);
			}

			.btn-approve {
				background: var(--dev-wallet-primary);
			}

			.btn-approve:hover {
				filter: brightness(0.9);
			}

			.btn-approve:disabled {
				cursor: default;
			}

			.error-message {
				color: var(--dev-wallet-destructive);
				font-size: 12px;
				margin-top: 8px;
			}
		`,
	];

	@property({ type: String })
	appName = '';

	@property({ type: String })
	appUrl = '';

	@property({ attribute: false })
	accounts: AccountInfo[] = [];

	@state()
	private _connecting = false;

	@state()
	private _error: string | null = null;

	@state()
	private _selectedAddresses: Set<string> = new Set();

	override willUpdate(changedProperties: Map<string, unknown>) {
		if (
			changedProperties.has('accounts') &&
			this.accounts.length > 0 &&
			this._selectedAddresses.size === 0
		) {
			this._selectedAddresses = new Set(this.accounts.map((a) => a.address));
		}
	}

	override render() {
		return html`
			<div class="connect-content">
				<div class="connect-header">
					<div class="connect-title">Connection Request</div>
					<div class="connect-desc">Select accounts to share with the app</div>
					${this.appName
						? html`
								<div class="app-info">
									<span class="app-name">${this.appName}</span>
									<span class="app-url">${this.appUrl}</span>
								</div>
							`
						: nothing}
				</div>
				${this.accounts.length > 0
					? html`
							<div class="account-list" part="account-list">
								${this.accounts.map(
									(account) => html`
										<label class="account-item">
											<input
												type="checkbox"
												.checked=${this._selectedAddresses.has(account.address)}
												@change=${() => this.#toggleAccount(account.address)}
											/>
											<div>
												${account.label
													? html`<div class="account-label">
															${account.label}${account.adapterName
																? html`<span class="account-adapter">${account.adapterName}</span>`
																: nothing}
														</div>`
													: nothing}
												<div class="account-address">${formatAddress(account.address)}</div>
											</div>
										</label>
									`,
								)}
							</div>
						`
					: nothing}
			</div>
			<div class="connect-footer">
				<div class="actions">
					<button class="btn btn-reject" part="reject-button" @click=${this.#reject}>Reject</button>
					<button
						class="btn btn-approve"
						part="approve-button"
						?disabled=${this._connecting || this._selectedAddresses.size === 0}
						@click=${this.#approve}
					>
						${this._connecting ? 'Connecting...' : `Connect (${this._selectedAddresses.size})`}
					</button>
				</div>
				${this._error
					? html`<p class="error-message" part="error-message">${this._error}</p>`
					: nothing}
			</div>
		`;
	}

	get selectedAddresses(): string[] {
		return [...this._selectedAddresses];
	}

	#toggleAccount(address: string) {
		this._selectedAddresses = toggleSetItem(this._selectedAddresses, address);
	}

	#approve() {
		this._connecting = true;
		this._error = null;
		emitEvent(this, 'approve', { selectedAddresses: this.selectedAddresses });
	}

	#reject() {
		emitEvent(this, 'reject');
	}

	showError(message: string) {
		this._connecting = false;
		this._error = message;
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'dev-wallet-connect': DevWalletConnect;
	}
}
