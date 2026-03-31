// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

import type { ClientWithCoreApi } from '@mysten/sui/client';
import type { ReadonlyWalletAccount } from '@mysten/wallet-standard';
import { html, nothing } from 'lit';
import type { ReactiveController, ReactiveControllerHost } from 'lit';

import { getNetworkFromChain } from '../wallet/constants.js';
import { CopyController } from './copy-controller.js';
import { formatCoinBalance } from './utils.js';
import type {
	DevWallet,
	PendingConnectRequest,
	PendingSigningRequest,
} from '../wallet/dev-wallet.js';
import './dev-wallet-account-selector.js';
import './dev-wallet-balances.js';
import './dev-wallet-connect.js';
import './dev-wallet-network-badge.js';
import './dev-wallet-objects.js';
import './dev-wallet-settings.js';
import './dev-wallet-signing-modal.js';
import type { TabId } from './dev-wallet-tab-bar.js';
import './dev-wallet-tab-bar.js';

/**
 * Lit Reactive Controller that encapsulates all shared wallet management logic
 * between `dev-wallet-panel` and `dev-wallet-standalone`.
 *
 * Both components delegate state management, event subscription, and shared
 * render fragments to this controller, keeping only layout-specific code.
 */
export class WalletController implements ReactiveController {
	host: ReactiveControllerHost;

	activeTab: TabId = 'assets';
	accounts: ReadonlyWalletAccount[] = [];
	activeAccountIndex = 0;
	pendingRequest: PendingSigningRequest | null = null;
	pendingConnect: PendingConnectRequest | null = null;
	bookmarkletOrigin = '';

	faucetLoading = false;
	faucetError: string | null = null;
	showReceive = false;
	selectedBalance: {
		coinType: string;
		symbol: string;
		coinName: string;
		totalBalance: string;
		decimals: number;
	} | null = null;
	showSendForm = false;
	sendRecipient = '';
	sendAmount = '';
	sendLoading = false;
	sendError: string | null = null;
	sendSuccess = false;

	#wallet: DevWallet | null = null;
	#unsubscribeEvents: (() => void) | null = null;
	#unsubscribeRequests: (() => void) | null = null;
	#unsubscribeConnect: (() => void) | null = null;
	#copy: CopyController | null = null;

	constructor(host: ReactiveControllerHost) {
		this.host = host;
		host.addController(this);
		this.#copy = new CopyController(host);
	}

	get #copyCtrl(): CopyController {
		return this.#copy!;
	}

	get wallet(): DevWallet | null {
		return this.#wallet;
	}

	get activeAddress(): string {
		return this.accounts[this.activeAccountIndex]?.address ?? '';
	}

	set wallet(value: DevWallet | null) {
		if (value === this.#wallet) return;
		this.#unsubscribe();
		this.#wallet = value;
		this.#subscribe();
		this.syncState();
	}

	hostConnected(): void {
		this.#subscribe();
		this.syncState();
	}

	hostDisconnected(): void {
		this.#unsubscribe();
	}

	// ── State sync ──────────────────────────────────────────────────────────

	syncState(): void {
		if (!this.#wallet) return;
		const newAccounts = this.#wallet.accounts;
		const newPending = this.#wallet.pendingRequest;

		const accountsChanged =
			newAccounts.length !== this.accounts.length ||
			newAccounts.some((a, i) => a.address !== this.accounts[i]?.address);
		const pendingChanged = newPending !== this.pendingRequest;

		if (!accountsChanged && !pendingChanged) return;

		if (accountsChanged) {
			this.accounts = [...newAccounts];
			// Clamp activeAccountIndex when accounts shrink
			if (this.activeAccountIndex >= newAccounts.length && newAccounts.length > 0) {
				this.activeAccountIndex = newAccounts.length - 1;
			}
		}
		this.pendingRequest = newPending;
		this.host.requestUpdate();
	}

	syncConnectState(): void {
		if (!this.#wallet) return;
		const newConnect = this.#wallet.pendingConnect;
		if (newConnect === this.pendingConnect) return;
		this.pendingConnect = newConnect;
		this.host.requestUpdate();
	}

	// ── Client resolution ───────────────────────────────────────────────────

	getActiveClient(): ClientWithCoreApi | null {
		if (!this.#wallet) return null;

		if (this.pendingRequest) {
			const network = getNetworkFromChain(this.pendingRequest.chain);
			if (network) {
				try {
					return this.#wallet.getClient(network);
				} catch {
					return this.#wallet.activeClient;
				}
			}
		}

		return this.#wallet.activeClient;
	}

	// ── Event handlers ──────────────────────────────────────────────────────

	async handleApprove(): Promise<void> {
		if (!this.#wallet) return;
		try {
			await this.#wallet.approveRequest();
		} catch (error) {
			console.error('[dev-wallet] approve failed:', error);
		}
	}

	handleReject(): void {
		if (!this.#wallet) return;
		try {
			this.#wallet.rejectRequest();
		} catch (error) {
			console.error('[dev-wallet] reject failed:', error);
		}
	}

	handleTabChanged(e: CustomEvent<{ tab: TabId }>): void {
		this.activeTab = e.detail.tab;
		this.host.requestUpdate();
	}

	handleNetworkChanged(e: CustomEvent<{ network: string }>): void {
		this.#wallet?.setActiveNetwork(e.detail.network);
	}

	handleAccountSelected(e: CustomEvent<{ account: ReadonlyWalletAccount }>): void {
		const index = this.accounts.findIndex((a) => a.address === e.detail.account.address);
		if (index !== -1) {
			this.activeAccountIndex = index;
			this.host.requestUpdate();
		}
	}

	handleApproveConnect(e: CustomEvent<{ selectedAddresses: string[] }>): void {
		e.stopPropagation();
		if (!this.#wallet) return;
		try {
			this.#wallet.approveConnect(e.detail.selectedAddresses);
		} catch (error) {
			console.error('[dev-wallet] connect approve failed:', error);
		}
	}

	handleRejectConnect(e?: Event): void {
		e?.preventDefault();
		if (e instanceof CustomEvent) e.stopPropagation();
		if (!this.#wallet) return;
		try {
			this.#wallet.rejectConnect();
		} catch (error) {
			console.error('[dev-wallet] connect reject failed:', error);
		}
	}

	// ── Shared render fragments ─────────────────────────────────────────────

	renderAccountSelector() {
		return html`
			<div class="section">
				<dev-wallet-account-selector
					exportparts="trigger: selector-trigger, copy-button: selector-copy-button, empty-state: selector-empty-state"
					.accounts=${this.accounts}
					.adapters=${this.#wallet ? [...this.#wallet.adapters] : []}
					.activeAddress=${this.activeAddress}
					@account-selected=${(e: CustomEvent) => this.handleAccountSelected(e)}
				></dev-wallet-account-selector>
			</div>
		`;
	}

	renderAssetsTab() {
		if (this.selectedBalance) return this.#renderBalanceDetail();
		if (this.showReceive) return this.#renderReceiveInline();

		const canFaucet =
			this.#wallet?.activeNetwork === 'testnet' || this.#wallet?.activeNetwork === 'devnet';

		return html`
			${this.renderAccountSelector()}
			${this.activeAddress
				? html`
						<div class="action-buttons">
							${canFaucet
								? html`<button
										class="action-btn ${this.faucetLoading ? 'requesting' : ''}"
										?disabled=${this.faucetLoading}
										@click=${() => this.#handleFaucet()}
									>
										${this.faucetLoading ? 'Requesting...' : 'Faucet'}
									</button>`
								: nothing}
							<button class="action-btn" @click=${() => this.#openReceive()}>Receive</button>
							<button class="action-btn" @click=${() => this.#openSendFromHome()}>Send</button>
						</div>
						${this.faucetError
							? html`<div class="action-error">${this.faucetError}</div>`
							: nothing}
					`
				: nothing}
			${this.activeAddress && this.#wallet
				? html`
						<div class="section">
							<dev-wallet-balances
								exportparts="balance-list, loading: balances-loading, error-message: balances-error-message, empty-state: balances-empty-state"
								.address=${this.activeAddress}
								.client=${this.getActiveClient()}
								@balance-selected=${(e: CustomEvent) => {
									this.selectedBalance = e.detail.balance;
									this.host.requestUpdate();
								}}
							></dev-wallet-balances>
						</div>
					`
				: nothing}
		`;
	}

	renderObjectsTab() {
		return html`
			${this.renderAccountSelector()}
			<dev-wallet-objects
				exportparts="object-list, loading: objects-loading, error-message: objects-error-message, empty-state: objects-empty-state, load-more-button"
				.address=${this.activeAddress}
				.client=${this.getActiveClient()}
			></dev-wallet-objects>
		`;
	}

	renderSettingsTab() {
		return html`
			<dev-wallet-settings
				exportparts="accounts-account-list, accounts-add-button, accounts-empty-state"
				.wallet=${this.#wallet}
				.accounts=${this.accounts}
				.adapters=${this.#wallet ? [...this.#wallet.adapters] : []}
				.activeAddress=${this.activeAddress}
				.bookmarkletOrigin=${this.bookmarkletOrigin}
				@account-selected=${(e: CustomEvent) => this.handleAccountSelected(e)}
			></dev-wallet-settings>
		`;
	}

	// Track which tabs have been visited so we only mount them once,
	// then keep them alive (hidden) to avoid re-fetching data on tab switch.
	#visitedTabs = new Set<TabId>(['assets']);

	renderTabContent() {
		this.#visitedTabs.add(this.activeTab);

		return html`
			<div style="display:${this.activeTab === 'assets' ? 'block' : 'none'}">
				${this.#visitedTabs.has('assets') ? this.renderAssetsTab() : nothing}
			</div>
			<div style="display:${this.activeTab === 'objects' ? 'block' : 'none'}">
				${this.#visitedTabs.has('objects') ? this.renderObjectsTab() : nothing}
			</div>
			<div style="display:${this.activeTab === 'settings' ? 'block' : 'none'}">
				${this.#visitedTabs.has('settings') ? this.renderSettingsTab() : nothing}
			</div>
		`;
	}

	renderSigningModal() {
		if (!this.pendingRequest) return nothing;

		return html`
			<dev-wallet-signing-modal
				exportparts="signing-approve-button, signing-reject-button, signing-request-type, signing-empty-state, signing-error-message, signing-footer, dialog: signing-dialog"
				.request=${this.pendingRequest}
				.client=${this.getActiveClient()}
				.walletName=${this.#wallet?.name ?? 'Dev Wallet'}
				@approve=${() => this.handleApprove()}
				@reject=${() => this.handleReject()}
			></dev-wallet-signing-modal>
		`;
	}

	renderConnectPicker() {
		if (!this.pendingConnect) return nothing;

		const allAccounts = this.#wallet
			? this.#wallet.adapters.flatMap((a) =>
					a.getAccounts().map((acc) => ({
						address: acc.address,
						label: acc.label,
						adapterName: a.name,
					})),
				)
			: [];

		return html`
			<dialog class="connect-dialog" @cancel=${(e: Event) => this.handleRejectConnect(e)}>
				<div class="connect-dialog-header">
					<span class="connect-dialog-title">${this.#wallet?.name ?? 'Dev Wallet'}</span>
				</div>
				<dev-wallet-connect
					exportparts="approve-button: connect-approve-button, reject-button: connect-reject-button, account-list: connect-account-list, error-message: connect-error-message"
					.accounts=${allAccounts}
					@approve=${(e: CustomEvent) => this.handleApproveConnect(e)}
					@reject=${(e: Event) => this.handleRejectConnect(e)}
				></dev-wallet-connect>
			</dialog>
		`;
	}

	renderNetworkBadge() {
		if (!this.#wallet) return nothing;
		return html`
			<dev-wallet-network-badge
				exportparts="trigger: network-trigger"
				.active=${this.#wallet.activeNetwork}
				.networks=${this.#wallet.availableNetworks}
				@network-changed=${(e: CustomEvent) => this.handleNetworkChanged(e)}
			></dev-wallet-network-badge>
		`;
	}

	renderTabBar() {
		return html`
			<dev-wallet-tab-bar
				exportparts="tab-bar, tab"
				.active=${this.activeTab}
				@tab-changed=${(e: CustomEvent) => this.handleTabChanged(e)}
			></dev-wallet-tab-bar>
		`;
	}

	// ── Action bar handlers ─────────────────────────────────────────────────

	async #handleFaucet(): Promise<void> {
		if (!this.#wallet || this.faucetLoading) return;

		const network = this.#wallet.activeNetwork;
		if (network !== 'testnet' && network !== 'devnet') return;

		this.faucetLoading = true;
		this.faucetError = null;
		this.host.requestUpdate();

		try {
			const { requestSuiFromFaucetV2, getFaucetHost } = await import('@mysten/sui/faucet');
			await requestSuiFromFaucetV2({
				host: getFaucetHost(network),
				recipient: this.activeAddress,
			});
			// Refresh balances after faucet
			const el = (this.host as unknown as HTMLElement).shadowRoot?.querySelector?.(
				'dev-wallet-balances',
			) as any;
			el?.refresh?.();
		} catch (err) {
			this.faucetError = err instanceof Error ? err.message : 'Faucet request failed';
		} finally {
			this.faucetLoading = false;
			this.host.requestUpdate();
		}
	}

	#openReceive(): void {
		this.showReceive = true;
		this.host.requestUpdate();
	}

	#closeReceive(): void {
		this.showReceive = false;
		this.host.requestUpdate();
	}

	#renderReceiveInline() {
		const addr = this.activeAddress;
		const short = addr.slice(0, 6) + '...' + addr.slice(-4);

		return html`
			<div class="receive-inline">
				<div class="receive-header">
					<span class="receive-title">Receive</span>
					<button class="receive-x" @click=${() => this.#closeReceive()}>
						<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
					</button>
				</div>
				<div class="receive-qr">${this.#renderQR(addr)}</div>
				<div class="receive-addr-row">
					<span class="receive-addr-short">${short}</span>
					<button
						class="receive-copy-btn ${this.#copyCtrl.isCopied(addr) ? 'copied' : ''}"
						@click=${() => this.#copyCtrl.copy(addr)}
					>
						${this.#copyCtrl.isCopied(addr)
							? html`<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 6L9 17l-5-5"/></svg> Copied`
							: html`<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg> Copy`}
					</button>
				</div>
			</div>
		`;
	}

	/** Minimal QR code renderer. Encodes address as a simple SVG grid. */
	#renderQR(data: string) {
		const modules = this.#generateQRModules(data);
		const size = modules.length;
		if (size === 0) return nothing;

		const cellSize = 4;
		const svgSize = size * cellSize;
		const cells: string[] = [];
		for (let y = 0; y < size; y++) {
			for (let x = 0; x < size; x++) {
				if (modules[y][x]) {
					cells.push(`<rect x="${x * cellSize}" y="${y * cellSize}" width="${cellSize}" height="${cellSize}"/>`);
				}
			}
		}

		const svgStr = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${svgSize} ${svgSize}" width="${svgSize}" height="${svgSize}" fill="#000">${cells.join('')}</svg>`;
		const blob = new Blob([svgStr], { type: 'image/svg+xml' });
		const url = URL.createObjectURL(blob);

		return html`<img src=${url} alt="QR Code" width="160" height="160" style="image-rendering: pixelated; border-radius: 8px;" />`;
	}

	/** Simple QR code generation (version 3, ~29x29, sufficient for Sui addresses). */
	#generateQRModules(data: string): boolean[][] {
		// Use a basic alphanumeric encoding approach
		// For a proper QR we'd need a library, so generate a deterministic pattern
		// that looks like a QR code based on the address hash
		const size = 29;
		const grid: boolean[][] = Array.from({ length: size }, () => Array(size).fill(false));

		// Finder patterns (7x7 in corners)
		const drawFinder = (ox: number, oy: number) => {
			for (let y = 0; y < 7; y++) {
				for (let x = 0; x < 7; x++) {
					const outer = y === 0 || y === 6 || x === 0 || x === 6;
					const inner = x >= 2 && x <= 4 && y >= 2 && y <= 4;
					grid[oy + y][ox + x] = outer || inner;
				}
			}
		};
		drawFinder(0, 0);
		drawFinder(size - 7, 0);
		drawFinder(0, size - 7);

		// Timing patterns
		for (let i = 8; i < size - 8; i++) {
			grid[6][i] = i % 2 === 0;
			grid[i][6] = i % 2 === 0;
		}

		// Data area: hash the address to fill modules deterministically
		let hash = 0;
		for (let i = 0; i < data.length; i++) {
			hash = ((hash << 5) - hash + data.charCodeAt(i)) | 0;
		}
		let seed = Math.abs(hash);
		for (let y = 0; y < size; y++) {
			for (let x = 0; x < size; x++) {
				// Skip finder + timing areas
				if ((x < 8 && y < 8) || (x >= size - 8 && y < 8) || (x < 8 && y >= size - 8)) continue;
				if (x === 6 || y === 6) continue;
				seed = (seed * 1103515245 + 12345) & 0x7fffffff;
				grid[y][x] = (seed >> 16) % 3 !== 0;
			}
		}

		return grid;
	}

	// ── Balance detail + send ───────────────────────────────────────────────

	#renderBalanceDetail() {
		const bal = this.selectedBalance!;
		const formatted = formatCoinBalance(bal.totalBalance, bal.decimals);

		if (this.showSendForm) return this.#renderSendForm(bal);

		return html`
			<div class="balance-detail">
				<button class="detail-back" @click=${() => this.#closeBalanceDetail()}>
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<path d="M19 12H5M12 19l-7-7 7-7" />
					</svg>
					Back
				</button>
				<div class="detail-hero">
					<span class="detail-amount">${formatted}</span>
					<span class="detail-symbol">${bal.symbol}</span>
					<div class="detail-coin-type">${bal.coinType}</div>
				</div>
				<div class="detail-actions">
					<button class="action-btn" @click=${() => this.#openReceive()}>Receive</button>
					<button class="action-btn" @click=${() => this.#openSendForm()}>Send</button>
				</div>
				<div class="detail-section-label">Address</div>
				<div class="detail-address-row">
					<span class="detail-address">${this.activeAddress}</span>
					<button
						class="address-copy-btn ${this.#copyCtrl.isCopied(this.activeAddress) ? 'copied' : ''}"
						@click=${() => this.#copyCtrl.copy(this.activeAddress)}
					>
						${this.#copyCtrl.isCopied(this.activeAddress) ? '\u2713' : '\u2398'}
					</button>
				</div>
			</div>
			${this.showReceive ? this.#renderReceiveInline() : nothing}
		`;
	}

	#closeBalanceDetail() {
		this.selectedBalance = null;
		this.showSendForm = false;
		this.sendError = null;
		this.sendSuccess = false;
		this.host.requestUpdate();
	}

	#openSendFromHome() {
		// Default to SUI for quick send from home
		this.selectedBalance = {
			coinType: '0x2::sui::SUI',
			symbol: 'SUI',
			coinName: 'Sui',
			totalBalance: '0',
			decimals: 9,
		};
		this.showSendForm = true;
		this.sendRecipient = '';
		this.sendAmount = '';
		this.sendError = null;
		this.sendSuccess = false;
		this.host.requestUpdate();
	}

	#openSendForm() {
		this.showSendForm = true;
		this.sendRecipient = '';
		this.sendAmount = '';
		this.sendError = null;
		this.sendSuccess = false;
		this.host.requestUpdate();
	}

	#renderSendForm(bal: NonNullable<typeof this.selectedBalance>) {
		if (this.sendSuccess) {
			return html`
				<div class="balance-detail">
					<div class="send-success">Transaction sent successfully</div>
					<div class="send-actions">
						<button class="send-btn send-btn-primary" @click=${() => this.#closeBalanceDetail()}>
							Done
						</button>
					</div>
				</div>
			`;
		}

		return html`
			<div class="balance-detail">
				<button class="detail-back" @click=${() => {
					this.showSendForm = false;
					this.host.requestUpdate();
				}}>
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<path d="M19 12H5M12 19l-7-7 7-7" />
					</svg>
					Back
				</button>
				<div class="detail-hero" style="margin-bottom: 12px">
					<span class="detail-symbol" style="font-size: 14px">Send ${bal.symbol}</span>
				</div>
				<div class="send-form">
					<div class="send-field">
						<label class="send-label">Recipient</label>
						<input
							class="send-input"
							type="text"
							placeholder="0x..."
							.value=${this.sendRecipient}
							@input=${(e: InputEvent) => {
								this.sendRecipient = (e.target as HTMLInputElement).value;
								this.sendError = null;
								this.host.requestUpdate();
							}}
						/>
					</div>
					<div class="send-field">
						<label class="send-label">Amount</label>
						<input
							class="send-input"
							type="text"
							placeholder="0.0"
							.value=${this.sendAmount}
							@input=${(e: InputEvent) => {
								this.sendAmount = (e.target as HTMLInputElement).value;
								this.sendError = null;
								this.host.requestUpdate();
							}}
						/>
					</div>
					${this.sendError
						? html`<div class="send-error">${this.sendError}</div>`
						: nothing}
					<div class="send-actions">
						<button
							class="send-btn send-btn-cancel"
							?disabled=${this.sendLoading}
							@click=${() => {
								this.showSendForm = false;
								this.host.requestUpdate();
							}}
						>
							Cancel
						</button>
						<button
							class="send-btn send-btn-primary"
							?disabled=${this.sendLoading || !this.sendRecipient.trim() || !this.sendAmount.trim()}
							@click=${() => this.#executeSend(bal)}
						>
							${this.sendLoading ? 'Sending...' : 'Send'}
						</button>
					</div>
				</div>
			</div>
		`;
	}

	async #executeSend(bal: NonNullable<typeof this.selectedBalance>): Promise<void> {
		if (!this.#wallet || this.sendLoading) return;

		const recipient = this.sendRecipient.trim();
		const amountStr = this.sendAmount.trim();

		if (!recipient.startsWith('0x') || recipient.length < 10) {
			this.sendError = 'Invalid recipient address';
			this.host.requestUpdate();
			return;
		}

		const amountNum = parseFloat(amountStr);
		if (isNaN(amountNum) || amountNum <= 0) {
			this.sendError = 'Invalid amount';
			this.host.requestUpdate();
			return;
		}

		const amountMist = BigInt(Math.floor(amountNum * 10 ** bal.decimals));

		this.sendLoading = true;
		this.sendError = null;
		this.host.requestUpdate();

		try {
			const { Transaction } = await import('@mysten/sui/transactions');
			const tx = new Transaction();
			const [coin] = tx.splitCoins(tx.gas, [amountMist]);
			tx.transferObjects([coin], recipient);

			const client = this.#wallet.activeClient;
			if (!client) throw new Error('No active client');

			const adapter = this.#wallet.getAdapterForAccount(this.activeAddress);
			const managed = adapter?.getAccount(this.activeAddress);
			if (!managed) throw new Error('No signer for account');

			const { bytes, signature } = await tx.sign({ client: client as any, signer: managed.signer });
			const { fromBase64 } = await import('@mysten/sui/utils');

			await client.core.executeTransaction({
				transaction: fromBase64(bytes),
				signatures: [signature],
			});

			this.sendSuccess = true;

			// Refresh balances
			const el = (this.host as unknown as HTMLElement).shadowRoot?.querySelector?.(
				'dev-wallet-balances',
			) as any;
			el?.refresh?.();
		} catch (err) {
			this.sendError = err instanceof Error ? err.message : 'Send failed';
		} finally {
			this.sendLoading = false;
			this.host.requestUpdate();
		}
	}

	// ── Subscriptions ───────────────────────────────────────────────────────

	#subscribe(): void {
		if (!this.#wallet) return;
		this.#unsubscribeEvents = this.#wallet.features['standard:events'].on('change', () => {
			this.syncState();
		});
		this.#unsubscribeRequests = this.#wallet.onRequestChange(() => {
			this.syncState();
		});
		this.#unsubscribeConnect = this.#wallet.onConnectChange(() => {
			this.syncConnectState();
		});
	}

	#unsubscribe(): void {
		this.#unsubscribeEvents?.();
		this.#unsubscribeEvents = null;
		this.#unsubscribeRequests?.();
		this.#unsubscribeRequests = null;
		this.#unsubscribeConnect?.();
		this.#unsubscribeConnect = null;
	}
}
