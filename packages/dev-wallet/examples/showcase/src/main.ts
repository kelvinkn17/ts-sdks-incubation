import { DevWallet } from '@mysten-incubation/dev-wallet';
import { InMemorySignerAdapter } from '@mysten-incubation/dev-wallet/adapters';

// Register all Lit custom elements
import '@mysten-incubation/dev-wallet/ui';

import type { DevWalletStandalone } from '@mysten-incubation/dev-wallet/ui';

// -- Mock data for showcase --------------------------------------------------

const MOCK_ACCOUNTS = [
	{
		address: '0xb12b78a29bda3c52a5a90c92e4c3ddf3ef51d4a3',
		label: 'Dev Account',
		adapterName: 'Memory',
	},
	{
		address: '0xa94f5374fce5edbc8e2a8697c15331677e6ebf0b',
		label: 'Test Account',
		adapterName: 'WebCrypto',
	},
	{
		address: '0x7e5f4552091a69125d5dfcb7b8c2659029395bdf',
		label: 'Deploy Account',
		adapterName: 'CLI',
	},
];

const MOCK_MESSAGE_REQUEST = {
	id: 'mock-req-2',
	type: 'sign-personal-message' as const,
	account: {
		address: '0xb12b78a29bda3c52a5a90c92e4c3ddf3ef51d4a3',
		publicKey: new Uint8Array(32),
		chains: ['sui:testnet' as const],
		features: [],
		label: 'Dev Account',
		icon: undefined,
	},
	chain: 'sui:testnet',
	data: new TextEncoder().encode(
		'Hello from Sui dApp! Please sign this message to verify your identity.',
	),
};

const MOCK_SIGNING_REQUEST = {
	id: 'mock-req-1',
	type: 'sign-and-execute-transaction' as const,
	account: {
		address: '0xb12b78a29bda3c52a5a90c92e4c3ddf3ef51d4a3',
		publicKey: new Uint8Array(32),
		chains: ['sui:testnet' as const],
		features: [],
		label: 'Dev Account',
		icon: undefined,
	},
	chain: 'sui:testnet',
	data: 'mock-tx-base64-data',
};

// -- Initialize wallet -------------------------------------------------------

async function initWallet(): Promise<DevWallet> {
	const adapter = new InMemorySignerAdapter();
	await adapter.initialize();
	await adapter.createAccount({ label: 'Dev Account' });
	await adapter.createAccount({ label: 'Test Account' });
	await adapter.createAccount({ label: 'Deploy Key' });

	return new DevWallet({
		adapters: [adapter],
		activeNetwork: 'testnet',
	});
}

// -- DOM helpers (no innerHTML to avoid XSS) ----------------------------------

function el(tag: string, attrs?: Record<string, string>): HTMLElement {
	const e = document.createElement(tag);
	if (attrs) Object.entries(attrs).forEach(([k, v]) => e.setAttribute(k, v));
	return e;
}

function text(tag: string, content: string, className?: string): HTMLElement {
	const e = document.createElement(tag);
	e.textContent = content;
	if (className) e.className = className;
	return e;
}

function createCard(title: string, subtitle: string, width = 380): HTMLElement {
	const card = el('div', { class: 'showcase-card' });
	card.style.width = `${width}px`;

	const header = el('div', { class: 'showcase-card-header' });
	header.appendChild(text('div', title, 'showcase-card-title'));
	header.appendChild(text('div', subtitle, 'showcase-card-subtitle'));
	card.appendChild(header);

	const body = el('div', { class: 'showcase-card-body' });
	card.appendChild(body);

	return card;
}

function getBody(card: HTMLElement): HTMLElement {
	return card.querySelector('.showcase-card-body')!;
}

function createSection(title: string, desc: string): HTMLElement {
	const section = el('div', { class: 'showcase-section' });
	section.appendChild(text('div', title, 'showcase-section-title'));
	section.appendChild(text('div', desc, 'showcase-section-desc'));
	return section;
}

// -- Build showcase -----------------------------------------------------------

async function buildShowcase() {
	const app = document.getElementById('app')!;

	// Page styles
	const style = document.createElement('style');
	style.textContent = `
		* { margin: 0; padding: 0; box-sizing: border-box; }

		body {
			background: #0a0a0f;
			color: #e2e8f0;
			font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
			min-height: 100vh;
		}

		#app {
			max-width: 1600px;
			margin: 0 auto;
			padding: 32px 24px;
		}

		.showcase-header {
			margin-bottom: 40px;
			border-bottom: 1px solid #1e293b;
			padding-bottom: 24px;
		}

		.showcase-section {
			margin-bottom: 48px;
		}

		.showcase-section-title {
			font-size: 18px;
			font-weight: 600;
			margin-bottom: 6px;
			color: #f1f5f9;
		}

		.showcase-section-desc {
			font-size: 13px;
			color: #64748b;
			margin-bottom: 20px;
		}

		.showcase-grid {
			display: flex;
			flex-wrap: wrap;
			gap: 24px;
			align-items: flex-start;
		}

		.showcase-card {
			background: #111118;
			border: 1px solid #1e293b;
			border-radius: 12px;
			overflow: hidden;
			flex-shrink: 0;
		}

		.showcase-card-header {
			padding: 12px 16px;
			border-bottom: 1px solid #1e293b;
			background: #0d0d14;
		}

		.showcase-card-title {
			font-size: 13px;
			font-weight: 600;
			color: #94a3b8;
		}

		.showcase-card-subtitle {
			font-size: 11px;
			color: #475569;
			margin-top: 2px;
		}

		.showcase-card-body {
			position: relative;
			min-height: 100px;
		}

		.standalone-container {
			height: 580px;
			overflow: hidden;
		}

		.standalone-container dev-wallet-standalone {
			--dev-wallet-background: #111118;
		}
	`;
	document.head.appendChild(style);

	const wallet = await initWallet();
	const accounts = wallet.accounts;

	// Page header
	const header = el('div', { class: 'showcase-header' });
	header.appendChild(text('h1', 'Dev Wallet UI Showcase'));
	header.appendChild(
		text(
			'p',
			`All component states rendered side by side for redesign reference. ${accounts.length} accounts loaded on testnet.`,
		),
	);
	app.appendChild(header);

	// ── Section 1: Standalone wallet (all tabs) ─────────────────────────────
	const section1 = createSection(
		'Standalone Wallet Views',
		'The main wallet card in all three tab states.',
	);

	const grid1 = el('div', { class: 'showcase-grid' });

	// Assets tab
	const assetsCard = createCard('Assets Tab', 'Balances view with account selector', 420);
	const assetsContainer = el('div', { class: 'standalone-container' });
	const assetsWallet = document.createElement('dev-wallet-standalone') as DevWalletStandalone;
	assetsWallet.wallet = wallet;
	assetsContainer.appendChild(assetsWallet);
	getBody(assetsCard).appendChild(assetsContainer);
	grid1.appendChild(assetsCard);

	// Objects tab
	const objectsCard = createCard('Objects Tab', 'Owned objects view', 420);
	const objectsContainer = el('div', { class: 'standalone-container' });
	const objectsWallet = document.createElement('dev-wallet-standalone') as DevWalletStandalone;
	objectsWallet.wallet = wallet;
	objectsContainer.appendChild(objectsWallet);
	getBody(objectsCard).appendChild(objectsContainer);
	grid1.appendChild(objectsCard);

	// Settings tab
	const settingsCard = createCard('Settings Tab', 'Networks, accounts, and config', 420);
	const settingsContainer = el('div', { class: 'standalone-container' });
	const settingsWallet = document.createElement(
		'dev-wallet-standalone',
	) as DevWalletStandalone;
	settingsWallet.wallet = wallet;
	settingsContainer.appendChild(settingsWallet);
	getBody(settingsCard).appendChild(settingsContainer);
	grid1.appendChild(settingsCard);

	section1.appendChild(grid1);
	app.appendChild(section1);

	// Switch tabs after components mount
	requestAnimationFrame(() => {
		setTimeout(() => {
			const objectsTabBar = objectsWallet.shadowRoot?.querySelector('dev-wallet-tab-bar');
			if (objectsTabBar) {
				objectsTabBar.dispatchEvent(
					new CustomEvent('tab-changed', {
						detail: { tab: 'objects' },
						bubbles: true,
						composed: true,
					}),
				);
			}

			const settingsTabBar =
				settingsWallet.shadowRoot?.querySelector('dev-wallet-tab-bar');
			if (settingsTabBar) {
				settingsTabBar.dispatchEvent(
					new CustomEvent('tab-changed', {
						detail: { tab: 'settings' },
						bubbles: true,
						composed: true,
					}),
				);
			}
		}, 200);
	});

	// ── Section 2: Signing Flow ─────────────────────────────────────────────
	const section2 = createSection(
		'Signing Flow',
		'Transaction approval, message signing, and error states.',
	);

	const grid2 = el('div', { class: 'showcase-grid' });

	// Signing: message
	const signingMsgCard = createCard('Sign Personal Message', 'Message approval request', 380);
	const signingMsg = document.createElement('dev-wallet-signing') as any;
	signingMsg.request = MOCK_MESSAGE_REQUEST;
	signingMsg.client = null;
	signingMsg.style.height = '380px';
	getBody(signingMsgCard).appendChild(signingMsg);
	grid2.appendChild(signingMsgCard);

	// Signing: no request
	const signingEmptyCard = createCard('No Pending Request', 'Empty state when idle', 380);
	const signingEmpty = document.createElement('dev-wallet-signing') as any;
	signingEmpty.request = null;
	signingEmpty.client = null;
	signingEmpty.style.height = '200px';
	getBody(signingEmptyCard).appendChild(signingEmpty);
	grid2.appendChild(signingEmptyCard);

	// Signing: transaction (will show analyzing / error since mock data)
	const signingTxCard = createCard(
		'Sign Transaction',
		'Transaction with analysis (analyzing state)',
		380,
	);
	const signingTx = document.createElement('dev-wallet-signing') as any;
	signingTx.request = MOCK_SIGNING_REQUEST;
	signingTx.client = null;
	signingTx.style.height = '380px';
	getBody(signingTxCard).appendChild(signingTx);
	grid2.appendChild(signingTxCard);

	section2.appendChild(grid2);
	app.appendChild(section2);

	// ── Section 3: Connect dialog ───────────────────────────────────────────
	const section3 = createSection(
		'Connection Flow',
		'Account selection when a dApp requests to connect.',
	);

	const grid3 = el('div', { class: 'showcase-grid' });

	// Connect: with app info
	const connectCard = createCard('Connect with App Info', 'Shows app name and URL', 380);
	const connect = document.createElement('dev-wallet-connect') as any;
	connect.appName = 'Cetus DEX';
	connect.appUrl = 'https://app.cetus.zone';
	connect.accounts = MOCK_ACCOUNTS;
	getBody(connectCard).appendChild(connect);
	grid3.appendChild(connectCard);

	// Connect: no app info
	const connectPlainCard = createCard('Connect (minimal)', 'No app info provided', 380);
	const connectPlain = document.createElement('dev-wallet-connect') as any;
	connectPlain.accounts = MOCK_ACCOUNTS.slice(0, 1);
	getBody(connectPlainCard).appendChild(connectPlain);
	grid3.appendChild(connectPlainCard);

	section3.appendChild(grid3);
	app.appendChild(section3);

	// ── Section 4: Sub-components ───────────────────────────────────────────
	const section4 = createSection(
		'Sub Components',
		'Individual pieces: balances, objects, account selector, network badge, tab bar.',
	);

	const grid4 = el('div', { class: 'showcase-grid' });

	// Balances
	const balancesCard = createCard('Balances', 'Fetches from testnet RPC', 380);
	const balances = document.createElement('dev-wallet-balances') as any;
	balances.address = accounts[0]?.address ?? '';
	balances.client = wallet.activeClient;
	balances.style.display = 'block';
	balances.style.padding = '16px';
	getBody(balancesCard).appendChild(balances);
	grid4.appendChild(balancesCard);

	// Objects
	const objectsSubCard = createCard('Objects', 'Fetches owned objects from testnet', 380);
	const objectsSub = document.createElement('dev-wallet-objects') as any;
	objectsSub.address = accounts[0]?.address ?? '';
	objectsSub.client = wallet.activeClient;
	objectsSub.style.display = 'block';
	objectsSub.style.padding = '16px';
	getBody(objectsSubCard).appendChild(objectsSub);
	grid4.appendChild(objectsSubCard);

	// Account selector
	const selectorCard = createCard('Account Selector', 'Dropdown for switching accounts', 380);
	const selector = document.createElement('dev-wallet-account-selector') as any;
	selector.accounts = accounts;
	selector.adapters = [...wallet.adapters];
	selector.activeAddress = accounts[0]?.address ?? '';
	selector.style.display = 'block';
	selector.style.padding = '16px';
	getBody(selectorCard).appendChild(selector);
	grid4.appendChild(selectorCard);

	// Network badge
	const badgeCard = createCard('Network Badge', 'Network selector dropdown', 380);
	const badge = document.createElement('dev-wallet-network-badge') as any;
	badge.active = 'testnet';
	badge.networks = ['devnet', 'testnet', 'localnet'];
	badge.style.display = 'block';
	badge.style.padding = '16px';
	getBody(badgeCard).appendChild(badge);
	grid4.appendChild(badgeCard);

	// Tab bar (assets active)
	const tabCard = createCard('Tab Bar', 'Navigation between wallet sections', 380);
	const tabBar = document.createElement('dev-wallet-tab-bar') as any;
	tabBar.active = 'assets';
	getBody(tabCard).appendChild(tabBar);
	grid4.appendChild(tabCard);

	// Tab bar (objects active)
	const tabCard2 = createCard('Tab Bar (Objects)', 'With objects tab active', 380);
	const tabBar2 = document.createElement('dev-wallet-tab-bar') as any;
	tabBar2.active = 'objects';
	getBody(tabCard2).appendChild(tabBar2);
	grid4.appendChild(tabCard2);

	section4.appendChild(grid4);
	app.appendChild(section4);

	// ── Section 5: Account management ───────────────────────────────────────
	const section5 = createSection(
		'Account Management',
		'Account list, creation, and management UI.',
	);

	const grid5 = el('div', { class: 'showcase-grid' });

	// Accounts list
	const accountsCard = createCard('Accounts List', 'All accounts with edit/delete', 420);
	const accountsList = document.createElement('dev-wallet-accounts') as any;
	accountsList.accounts = accounts;
	accountsList.adapters = [...wallet.adapters];
	accountsList.activeAddress = accounts[0]?.address ?? '';
	accountsList.style.display = 'block';
	accountsList.style.padding = '16px';
	getBody(accountsCard).appendChild(accountsList);
	grid5.appendChild(accountsCard);

	// Settings
	const settingsSubCard = createCard('Settings Panel', 'Networks + accounts + about', 420);
	const settings = document.createElement('dev-wallet-settings') as any;
	settings.wallet = wallet;
	settings.accounts = accounts;
	settings.adapters = [...wallet.adapters];
	settings.activeAddress = accounts[0]?.address ?? '';
	settings.style.display = 'block';
	settings.style.padding = '16px';
	settings.style.maxHeight = '500px';
	settings.style.overflowY = 'auto';
	getBody(settingsSubCard).appendChild(settings);
	grid5.appendChild(settingsSubCard);

	section5.appendChild(grid5);
	app.appendChild(section5);

	// ── Section 6: FAB ──────────────────────────────────────────────────────
	const section6 = createSection(
		'Panel Trigger (FAB)',
		'The floating action button. Shown here in static position for reference.',
	);

	const grid6 = el('div', { class: 'showcase-grid' });

	const fabCard = createCard('FAB Button', 'Click to open the panel', 200);
	const panel = document.createElement('dev-wallet-panel') as any;
	panel.wallet = wallet;
	panel.style.display = 'flex';
	panel.style.justifyContent = 'center';
	panel.style.padding = '24px';
	panel.style.position = 'relative';
	getBody(fabCard).appendChild(panel);
	grid6.appendChild(fabCard);

	section6.appendChild(grid6);
	app.appendChild(section6);
}

buildShowcase().catch(console.error);
