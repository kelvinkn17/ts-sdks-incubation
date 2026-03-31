// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

import type { ReadonlyWalletAccount } from '@mysten/wallet-standard';
import { css, html, LitElement, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

import type { DevWallet } from '../wallet/dev-wallet.js';
import type { SignerAdapter } from '../types.js';
import { sectionHeaderStyles, settingsToggleStyles, sharedStyles } from './styles.js';
import { emitEvent, formatAddress, getErrorMessage, NETWORK_COLORS } from './utils.js';
import './dev-wallet-accounts.js';

@customElement('dev-wallet-settings')
export class DevWalletSettings extends LitElement {
	static override styles = [
		sharedStyles,
		sectionHeaderStyles,
		settingsToggleStyles,
		css`
			:host {
				display: block;
			}

			.section {
				margin-bottom: 28px;
			}

			.section:last-child {
				margin-bottom: 0;
			}

			/* -- Networks --------------------------------------------------- */

			.network-list {
				display: flex;
				flex-direction: column;
			}

			.network-item {
				display: flex;
				align-items: flex-start;
				gap: 12px;
				padding: 14px 0;
				border-bottom: 1px solid var(--dev-wallet-border);
			}

			.network-item:last-child {
				border-bottom: none;
			}

			.network-dot {
				width: 8px;
				height: 8px;
				border-radius: 50%;
				flex-shrink: 0;
				margin-top: 5px;
			}

			.network-info {
				flex: 1;
				min-width: 0;
			}

			.network-name-row {
				display: flex;
				align-items: center;
				gap: 8px;
				margin-bottom: 2px;
			}

			.network-name {
				font-size: 14px;
				font-weight: var(--dev-wallet-font-weight-medium);
				color: var(--dev-wallet-foreground);
			}

			.network-active-badge {
				font-size: 10px;
				padding: 2px 8px;
				border-radius: 999px;
				background: rgba(0, 178, 255, 0.1);
				color: var(--dev-wallet-primary);
				font-weight: var(--dev-wallet-font-weight-medium);
			}

			.network-url {
				font-size: 12px;
				color: var(--dev-wallet-tertiary);
				font-family: var(--dev-wallet-font-mono);
				overflow: hidden;
				text-overflow: ellipsis;
				white-space: nowrap;
			}

			.network-url-input {
				width: 100%;
				padding: 6px 10px;
				border-radius: var(--dev-wallet-radius-sm);
				border: 1px solid var(--dev-wallet-border-med);
				background: var(--dev-wallet-secondary);
				color: var(--dev-wallet-foreground);
				font-size: 12px;
				font-family: var(--dev-wallet-font-mono);
				outline: none;
				box-sizing: border-box;
				margin-top: 4px;
			}

			.network-url-input:focus {
				border-color: var(--dev-wallet-primary);
			}

			.network-actions {
				display: flex;
				gap: 4px;
				flex-shrink: 0;
				margin-top: 2px;
			}

			.btn-icon {
				width: 28px;
				height: 28px;
				display: flex;
				align-items: center;
				justify-content: center;
				border-radius: var(--dev-wallet-radius-xs);
				font-size: 13px;
				color: var(--dev-wallet-tertiary);
			}

			.btn-icon:hover {
				color: var(--dev-wallet-foreground);
				background: var(--dev-wallet-hover);
			}

			.btn-icon-danger:hover {
				color: var(--dev-wallet-destructive);
				background: rgba(255, 43, 58, 0.08);
			}

			/* -- Add network form --------------------------------------------- */

			.add-network-form {
				display: flex;
				flex-direction: column;
				gap: 10px;
				margin-top: 16px;
				padding: 16px;
				border-radius: var(--dev-wallet-radius);
				border: 1px solid var(--dev-wallet-border);
				background: var(--dev-wallet-secondary);
			}

			.form-input {
				width: 100%;
				padding: 10px 12px;
				border-radius: var(--dev-wallet-radius-sm);
				border: 1px solid var(--dev-wallet-border);
				background: var(--dev-wallet-background);
				color: var(--dev-wallet-foreground);
				font-size: 13px;
				font-family: inherit;
				outline: none;
				box-sizing: border-box;
			}

			.form-input:focus {
				border-color: var(--dev-wallet-primary);
			}

			.form-input::placeholder {
				color: var(--dev-wallet-tertiary);
			}

			.form-actions {
				display: flex;
				gap: 8px;
				justify-content: flex-end;
			}

			.btn-sm {
				padding: 8px 16px;
				border-radius: 999px;
				font-size: 12px;
				font-weight: var(--dev-wallet-font-weight-medium);
			}

			.btn-add {
				background: var(--dev-wallet-primary);
				color: var(--dev-wallet-primary-foreground);
			}

			.btn-add:disabled {
				opacity: 0.4;
				cursor: not-allowed;
			}

			.btn-cancel-sm {
				background: transparent;
				color: var(--dev-wallet-muted-foreground);
			}

			.btn-cancel-sm:hover {
				color: var(--dev-wallet-foreground);
			}

			.btn-toggle {
				font-size: 13px;
				color: var(--dev-wallet-primary);
				padding: 8px 0;
				margin-top: 4px;
			}

			.btn-toggle:hover {
				text-decoration: underline;
			}

			/* -- CLI Signer ------------------------------------------------- */

			.cli-section-column {
				flex-direction: column;
				align-items: flex-start;
				gap: 8px;
			}

			.cli-header-row {
				display: flex;
				align-items: center;
				gap: 10px;
				width: 100%;
			}

			.cli-accounts-list {
				width: 100%;
				padding-left: 20px;
			}

			.cli-accounts-list .network-url {
				padding: 3px 0;
			}

			.cli-hint {
				padding-left: 20px;
				margin-top: 0;
				font-size: 13px;
			}

			.cli-unpaired-hint {
				margin-top: 10px;
			}

			/* -- About / general text --------------------------------------- */

			.about {
				font-size: 13px;
				color: var(--dev-wallet-muted-foreground);
				line-height: 1.6;
			}

			.about strong {
				color: var(--dev-wallet-foreground);
				font-weight: var(--dev-wallet-font-weight-medium);
			}

			.error {
				font-size: 12px;
				color: var(--dev-wallet-destructive);
				margin-top: 6px;
			}

			/* -- Bookmarklet ------------------------------------------------ */

			.bookmarklet-link-wrapper {
				margin-top: 12px;
			}

			.bookmarklet-link {
				display: inline-flex;
				align-items: center;
				gap: 6px;
				padding: 10px 18px;
				border-radius: 999px;
				background: var(--dev-wallet-primary);
				color: var(--dev-wallet-primary-foreground);
				font-size: 13px;
				font-weight: var(--dev-wallet-font-weight-semibold);
				text-decoration: none;
				cursor: grab;
				user-select: none;
			}

			.bookmarklet-link:hover {
				filter: brightness(0.9);
			}

			.bookmarklet-link:active {
				cursor: grabbing;
			}

			.bookmarklet-url {
				font-family: var(--dev-wallet-font-mono);
				font-size: 11px;
				color: var(--dev-wallet-tertiary);
				word-break: break-all;
				user-select: all;
			}

			.console-snippet {
				position: relative;
				margin-top: 10px;
				padding: 14px 16px;
				border-radius: var(--dev-wallet-radius);
				background: var(--dev-wallet-secondary);
				border: 1px solid var(--dev-wallet-border);
				font-family: var(--dev-wallet-font-mono);
				font-size: 12px;
				color: var(--dev-wallet-foreground);
				line-height: 1.6;
				white-space: pre-wrap;
				word-break: break-all;
				user-select: all;
			}

			.btn-copy {
				position: absolute;
				top: 8px;
				right: 8px;
				padding: 4px 10px;
				border-radius: 999px;
				background: var(--dev-wallet-active);
				color: var(--dev-wallet-muted-foreground);
				font-size: 11px;
				font-family: inherit;
				cursor: pointer;
			}

			.btn-copy:hover {
				background: var(--dev-wallet-active);
				color: var(--dev-wallet-foreground);
			}
		`,
	];

	@property({ attribute: false })
	wallet: DevWallet | null = null;

	@property({ attribute: false })
	accounts: readonly ReadonlyWalletAccount[] = [];

	@property({ attribute: false })
	adapters: SignerAdapter[] = [];

	@property({ type: String })
	activeAddress = '';

	@property({ type: String })
	bookmarkletOrigin = '';

	@state()
	private _showAddNetwork = false;

	@state()
	private _networkName = '';

	@state()
	private _networkUrl = '';

	@state()
	private _error: string | null = null;

	@state()
	private _editingNetwork: string | null = null;

	@state()
	private _editingUrl = '';

	@state()
	private _copied = false;

	@state()
	private _panelState: 'open' | 'closed' | 'remember' = 'open';

	@state()
	private _theme: 'system' | 'light' | 'dark' = 'dark';

	override connectedCallback() {
		super.connectedCallback();
		try {
			const ps = localStorage.getItem('dev-wallet:panel-state');
			if (ps === 'open' || ps === 'closed' || ps === 'remember') this._panelState = ps;
			const th = localStorage.getItem('dev-wallet:theme');
			if (th === 'system' || th === 'light' || th === 'dark') this._theme = th;
		} catch {
			// localStorage unavailable
		}
	}

	override render() {
		return html`
			<div class="section">${this.#renderNetworks()}</div>
			${this.#hasCliAdapter()
				? html`<div class="section">${this.#renderCliSigner()}</div>`
				: nothing}
			<div class="section">${this.#renderAccounts()}</div>
			<div class="section">${this.#renderPreferences()}</div>
			<div class="section">${this.#renderBookmarklet()}</div>
			<div class="section">${this.#renderAbout()}</div>
		`;
	}

	#renderNetworks() {
		if (!this.wallet) return nothing;

		const networks = this.wallet.availableNetworks;
		const activeNetwork = this.wallet.activeNetwork;
		const urls = this.wallet.networkUrls;

		return html`
			<h3 class="section-header">Networks</h3>
			<div class="network-list">
				${networks.map((name) => {
					const color = NETWORK_COLORS[name] ?? '#888';
					const isActive = name === activeNetwork;
					const isEditing = this._editingNetwork === name;
					return html`
						<div class="network-item">
							<span class="network-dot" style="background: ${color}"></span>
							<div class="network-info">
								<div class="network-name-row">
									<span class="network-name">${name}</span>
									${isActive
										? html`<span class="network-active-badge">Active</span>`
										: nothing}
								</div>
								${isEditing
									? html`<input
											class="network-url-input"
											type="text"
											.value=${this._editingUrl}
											@input=${(e: InputEvent) => {
												this._editingUrl = (e.target as HTMLInputElement).value;
											}}
											@keydown=${(e: KeyboardEvent) => {
												if (e.key === 'Enter') this.#saveNetworkUrl(name);
												if (e.key === 'Escape') this.#cancelEditNetwork();
											}}
										/>`
									: html`<span class="network-url" title=${urls[name] ?? ''}
											>${urls[name] ?? ''}</span
										>`}
							</div>
							<div class="network-actions">
								${isEditing
									? html`
											<button
												class="btn-icon"
												title="Save"
												aria-label="Save URL"
												@click=${() => this.#saveNetworkUrl(name)}
											>
												<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 6L9 17l-5-5"/></svg>
											</button>
											<button
												class="btn-icon"
												title="Cancel"
												aria-label="Cancel editing"
												@click=${this.#cancelEditNetwork}
											>
												<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
											</button>
										`
									: html`
											<button
												class="btn-icon"
												title="Edit URL"
												aria-label="Edit network URL"
												@click=${() => this.#startEditNetwork(name, urls[name] ?? '')}
											>
												<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 3a2.83 2.83 0 114 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
											</button>
											${!isActive
												? html`<button
														class="btn-icon btn-icon-danger"
														title="Remove"
														aria-label="Remove network"
														@click=${() => this.#removeNetwork(name)}
													>
														<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
													</button>`
												: nothing}
										`}
							</div>
						</div>
					`;
				})}
			</div>
			${this._showAddNetwork
				? this.#renderAddNetworkForm()
				: html`
						<button
							class="btn-toggle"
							@click=${() => {
								this._showAddNetwork = true;
							}}
						>
							+ Add Network
						</button>
					`}
		`;
	}

	#renderAddNetworkForm() {
		return html`
			<div class="add-network-form">
				<input
					class="form-input"
					type="text"
					placeholder="Network name (e.g. custom)"
					.value=${this._networkName}
					@input=${(e: InputEvent) => {
						this._networkName = (e.target as HTMLInputElement).value;
						this._error = null;
					}}
				/>
				<input
					class="form-input"
					type="text"
					placeholder="gRPC URL (e.g. http://localhost:9000)"
					.value=${this._networkUrl}
					@input=${(e: InputEvent) => {
						this._networkUrl = (e.target as HTMLInputElement).value;
						this._error = null;
					}}
					@keydown=${(e: KeyboardEvent) => {
						if (e.key === 'Enter') this.#addNetwork();
						if (e.key === 'Escape') this.#cancelAddNetwork();
					}}
				/>
				${this._error ? html`<div class="error">${this._error}</div>` : nothing}
				<div class="form-actions">
					<button
						class="btn-sm btn-add"
						?disabled=${!this._networkName.trim() || !this._networkUrl.trim()}
						@click=${this.#addNetwork}
					>
						Add
					</button>
					<button class="btn-sm btn-cancel-sm" @click=${this.#cancelAddNetwork}>Cancel</button>
				</div>
			</div>
		`;
	}

	#hasCliAdapter(): boolean {
		return this.adapters.some((a) => a.id === 'remote-cli');
	}

	#renderCliSigner() {
		const cliAdapter = this.adapters.find((a) => a.id === 'remote-cli');
		if (!cliAdapter) return nothing;

		const isPaired = 'isPaired' in cliAdapter && (cliAdapter as { isPaired: boolean }).isPaired;
		const cliAccounts = cliAdapter.getAccounts();

		return html`
			<h3 class="section-header">CLI Signer</h3>
			${isPaired
				? html`
						<div class="network-item active cli-section-column">
							<div class="cli-header-row">
								<span
									class="network-dot"
									style="background: var(--dev-wallet-status-connected)"
								></span>
								<span class="network-name">Connected</span>
								${cliAccounts.length > 0
									? html`<span class="network-active-badge">${cliAccounts.length} imported</span>`
									: nothing}
							</div>
							${cliAccounts.length > 0
								? html`<div class="cli-accounts-list">
										${cliAccounts.map(
											(acc) => html`
												<div class="network-url">${acc.label} (${formatAddress(acc.address)})</div>
											`,
										)}
									</div>`
								: html`<div class="about cli-hint">Use + Add above to import CLI accounts.</div>`}
						</div>
					`
				: html`
						<div class="network-item">
							<span
								class="network-dot"
								style="background: var(--dev-wallet-status-disconnected)"
							></span>
							<span class="network-name" style="color: var(--dev-wallet-muted-foreground)"
								>Not connected</span
							>
						</div>
						<div class="about cli-unpaired-hint">
							Open the token URL from your terminal to connect CLI accounts.
						</div>
					`}
		`;
	}

	#renderAccounts() {
		return html`
			<dev-wallet-accounts
				exportparts="account-list: accounts-account-list, add-button: accounts-add-button, empty-state: accounts-empty-state"
				.accounts=${this.accounts}
				.adapters=${this.adapters}
				.activeAddress=${this.activeAddress}
			></dev-wallet-accounts>
		`;
	}

	#renderBookmarklet() {
		if (!this.bookmarkletOrigin) return nothing;
		const origin = this.bookmarkletOrigin;

		const bookmarkletJs = `${origin}/bookmarklet.js`;
		const bookmarkletHref = `javascript:void(document.head.appendChild(Object.assign(document.createElement('script'),{src:'${bookmarkletJs}'})))`;
		const consoleSnippet = `var s=document.createElement('script');s.src='${bookmarkletJs}';document.head.appendChild(s);`;

		return html`
			<h3 class="section-header">Bookmarklet</h3>
			<div class="about">
				Drag this link to your bookmarks bar, then click it on any dApp to inject the wallet:
			</div>
			<div class="bookmarklet-link-wrapper">
				<a
					class="bookmarklet-link"
					href=${bookmarkletHref}
					title="Drag to bookmarks bar"
					@click=${(e: MouseEvent) => e.preventDefault()}
				>
					Dev Wallet
				</a>
			</div>
			<div class="about" style="margin-top: 12px">Or paste this in the browser console:</div>
			<div class="console-snippet">
				${consoleSnippet}
				<button class="btn-copy" @click=${() => this.#copySnippet(consoleSnippet)}>
					${this._copied ? 'Copied!' : 'Copy'}
				</button>
			</div>
			<div class="about" style="margin-top: 8px">
				Or add this script to your page:<br />
				<code class="bookmarklet-url">${bookmarkletJs}</code>
			</div>
		`;
	}

	#copySnippet(text: string) {
		navigator.clipboard.writeText(text).then(() => {
			this._copied = true;
			setTimeout(() => {
				this._copied = false;
			}, 2000);
		});
	}

	#renderPreferences() {
		return html`
			<h3 class="section-header">Preferences</h3>
			<div class="setting-row">
				<span class="setting-label">Theme</span>
				<div class="segmented-control">
					${(['system', 'light', 'dark'] as const).map(
						(val) => html`
							<button
								class="segment ${this._theme === val ? 'active' : ''}"
								@click=${() => this.#setTheme(val)}
							>
								${val[0].toUpperCase() + val.slice(1)}
							</button>
						`,
					)}
				</div>
			</div>
			<div class="setting-row">
				<span class="setting-label">Panel on load</span>
				<div class="segmented-control">
					${(['open', 'closed', 'remember'] as const).map(
						(val) => html`
							<button
								class="segment ${this._panelState === val ? 'active' : ''}"
								@click=${() => this.#setPanelState(val)}
							>
								${val[0].toUpperCase() + val.slice(1)}
							</button>
						`,
					)}
				</div>
			</div>
		`;
	}

	#setTheme(value: 'system' | 'light' | 'dark') {
		this._theme = value;
		try {
			localStorage.setItem('dev-wallet:theme', value);
		} catch {
			// ignore
		}
		emitEvent(this, 'setting-changed', { key: 'theme', value });
	}

	#setPanelState(value: 'open' | 'closed' | 'remember') {
		this._panelState = value;
		try {
			localStorage.setItem('dev-wallet:panel-state', value);
		} catch {
			// ignore
		}
		emitEvent(this, 'setting-changed', { key: 'panel-state', value });
	}

	#renderAbout() {
		return html`
			<h3 class="section-header">About</h3>
			<div class="about">
				<strong>${this.wallet?.name ?? 'Dev Wallet'}</strong><br />
				A development wallet for testing Sui dApps.<br />
				${this.wallet
					? html`${this.wallet.accounts.length} account(s) across ${this.wallet.adapters.length}
						adapter(s)`
					: nothing}
			</div>
		`;
	}

	#addNetwork() {
		if (!this.wallet) return;

		const name = this._networkName.trim();
		const url = this._networkUrl.trim();

		if (!name || !url) return;

		if (this.wallet.availableNetworks.includes(name)) {
			this._error = `Network "${name}" already exists`;
			return;
		}

		try {
			this.wallet.addNetwork(name, url);
			this._networkName = '';
			this._networkUrl = '';
			this._showAddNetwork = false;
			this._error = null;
			emitEvent(this, 'network-added', { name, url });
		} catch (err) {
			this._error = getErrorMessage(err, 'Failed to add network');
		}
	}

	#cancelAddNetwork() {
		this._showAddNetwork = false;
		this._networkName = '';
		this._networkUrl = '';
		this._error = null;
	}

	#startEditNetwork(name: string, url: string) {
		this._editingNetwork = name;
		this._editingUrl = url;
	}

	#saveNetworkUrl(name: string) {
		if (!this.wallet) return;
		const url = this._editingUrl.trim();
		if (!url) return;

		try {
			this.wallet.addNetwork(name, url);
			this._editingNetwork = null;
			this._editingUrl = '';
		} catch (error) {
			this._error = error instanceof Error ? error.message : 'Invalid URL';
		}
	}

	#cancelEditNetwork() {
		this._editingNetwork = null;
		this._editingUrl = '';
	}

	#removeNetwork(name: string) {
		if (!this.wallet) return;
		this.wallet.removeNetwork(name);
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'dev-wallet-settings': DevWalletSettings;
	}
}
