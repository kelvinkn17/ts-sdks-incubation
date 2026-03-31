import { DevWallet } from '@mysten-incubation/dev-wallet';
import { InMemorySignerAdapter } from '@mysten-incubation/dev-wallet/adapters';

import '@mysten-incubation/dev-wallet/ui';

import type { DevWalletStandalone } from '@mysten-incubation/dev-wallet/ui';

// -- Mock data ----------------------------------------------------------------

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

// -- Initialize wallet --------------------------------------------------------

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

// -- DOM helpers (no innerHTML for XSS) ---------------------------------------

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

function createCard(
	title: string,
	tagName: string,
	subtitle: string,
	width?: number,
): HTMLElement {
	const card = el('div', { class: 'showcase-card' });
	if (width) card.style.width = `${width}px`;

	const header = el('div', { class: 'showcase-card-header' });
	const titleRow = el('div', { class: 'showcase-card-title-row' });
	titleRow.appendChild(text('span', title, 'showcase-card-title'));
	if (tagName) {
		titleRow.appendChild(text('code', `<${tagName}>`, 'showcase-card-tag'));
	}
	header.appendChild(titleRow);
	header.appendChild(text('div', subtitle, 'showcase-card-subtitle'));
	card.appendChild(header);

	const body = el('div', { class: 'showcase-card-body' });
	card.appendChild(body);

	return card;
}

function getBody(card: HTMLElement): HTMLElement {
	return card.querySelector('.showcase-card-body')!;
}

function createSection(id: string, title: string, desc: string): HTMLElement {
	const section = el('div', { class: 'showcase-section', id });
	section.appendChild(text('h2', title, 'showcase-section-title'));
	section.appendChild(text('p', desc, 'showcase-section-desc'));
	return section;
}

function createSubgroup(title: string): HTMLElement {
	const group = el('div', { class: 'showcase-subgroup' });
	group.appendChild(text('h3', title, 'showcase-subgroup-title'));
	return group;
}

// -- Build showcase -----------------------------------------------------------

async function buildShowcase() {
	const app = document.getElementById('app')!;

	const style = document.createElement('style');
	style.textContent = `
		* { margin: 0; padding: 0; box-sizing: border-box; }

		body {
			background: #141414;
			color: #f5f5f5;
			font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
			min-height: 100vh;
			letter-spacing: -0.01em;
		}

		#app {
			max-width: 1400px;
			margin: 0 auto;
			padding: 32px 24px 120px;
		}

		/* -- Header ----------------------------------------------------------- */

		.showcase-header {
			margin-bottom: 16px;
			padding-bottom: 16px;
			border-bottom: 1px solid rgba(255, 255, 255, 0.06);
		}

		.showcase-header h1 {
			font-size: 16px;
			font-weight: 600;
			color: #f5f5f5;
			margin-bottom: 4px;
		}

		.showcase-header p {
			font-size: 12px;
			color: rgba(255, 255, 255, 0.4);
		}

		/* -- Sticky Nav ------------------------------------------------------- */

		.showcase-nav {
			position: sticky;
			top: 0;
			z-index: 100;
			background: rgba(20, 20, 20, 0.9);
			backdrop-filter: blur(12px);
			border-bottom: 1px solid rgba(255, 255, 255, 0.06);
			padding: 10px 0;
			margin-bottom: 32px;
			display: flex;
			gap: 2px;
		}

		.showcase-nav a {
			color: rgba(255, 255, 255, 0.4);
			text-decoration: none;
			font-size: 12px;
			font-weight: 500;
			padding: 5px 12px;
			border-radius: 6px;
			transition: color 0.15s;
		}

		.showcase-nav a:hover {
			color: #f5f5f5;
		}

		.showcase-nav a.active {
			color: #f5f5f5;
		}

		/* -- Sections --------------------------------------------------------- */

		.showcase-section {
			margin-bottom: 48px;
			scroll-margin-top: 60px;
		}

		.showcase-section-title {
			font-size: 15px;
			font-weight: 600;
			color: #f5f5f5;
			margin-bottom: 4px;
		}

		.showcase-section-desc {
			font-size: 12px;
			color: rgba(255, 255, 255, 0.4);
			margin-bottom: 20px;
		}

		/* -- Subgroups -------------------------------------------------------- */

		.showcase-subgroup {
			margin-bottom: 24px;
		}

		.showcase-subgroup-title {
			font-size: 11px;
			font-weight: 600;
			color: rgba(255, 255, 255, 0.3);
			text-transform: uppercase;
			letter-spacing: 0.05em;
			margin-bottom: 12px;
		}

		/* -- Grid ------------------------------------------------------------- */

		.showcase-grid {
			display: flex;
			flex-wrap: wrap;
			gap: 20px;
			align-items: flex-start;
		}

		/* -- Cards ------------------------------------------------------------ */

		.showcase-card {
			background: #1c1c1e;
			border: 1px solid rgba(255, 255, 255, 0.06);
			border-radius: 14px;
			overflow: hidden;
			flex-shrink: 0;
			flex-grow: 0;
		}

		.showcase-card-header {
			padding: 10px 14px;
			border-bottom: 1px solid rgba(255, 255, 255, 0.06);
		}

		.showcase-card-title-row {
			display: flex;
			align-items: center;
			gap: 8px;
		}

		.showcase-card-title {
			font-size: 12px;
			font-weight: 500;
			color: rgba(255, 255, 255, 0.5);
		}

		.showcase-card-tag {
			font-size: 10px;
			color: rgba(255, 255, 255, 0.25);
			font-family: 'SF Mono', 'Fira Code', monospace;
			background: rgba(255, 255, 255, 0.04);
			padding: 2px 6px;
			border-radius: 4px;
		}

		.showcase-card-subtitle {
			font-size: 11px;
			color: rgba(255, 255, 255, 0.25);
			margin-top: 2px;
		}

		.showcase-card-body {
			position: relative;
			min-height: 80px;
		}

		/* -- Standalone wallet container -------------------------------------- */

		.standalone-container {
			height: 560px;
			overflow: hidden;
		}

		.standalone-container dev-wallet-standalone {
			--dev-wallet-background: #1c1c1e;
		}
	`;
	document.head.appendChild(style);

	const wallet = await initWallet();
	const accounts = wallet.accounts;

	// -- Header ---------------------------------------------------------------

	const header = el('div', { class: 'showcase-header' });
	header.appendChild(text('h1', 'Dev Wallet Showcase'));
	header.appendChild(
		text(
			'p',
			`${accounts.length} accounts on testnet. Component reference for development.`,
		),
	);
	app.appendChild(header);

	// -- Sticky Nav ------------------------------------------------------------

	const nav = el('nav', { class: 'showcase-nav' });
	const sections = [
		{ id: 'wallet', label: 'Wallet' },
		{ id: 'flows', label: 'Flows' },
		{ id: 'components', label: 'Components' },
	];
	sections.forEach(({ id, label }) => {
		const a = el('a', { href: `#${id}` });
		a.textContent = label;
		nav.appendChild(a);
	});
	app.appendChild(nav);

	// Scroll spy: highlight active nav link
	const observer = new IntersectionObserver(
		(entries) => {
			entries.forEach((entry) => {
				const link = nav.querySelector(`a[href="#${entry.target.id}"]`);
				if (entry.isIntersecting) {
					nav.querySelectorAll('a').forEach((a) => a.classList.remove('active'));
					link?.classList.add('active');
				}
			});
		},
		{ rootMargin: '-80px 0px -60% 0px' },
	);

	// -- Section 1: Interactive Wallet ----------------------------------------

	const s1 = createSection(
		'wallet',
		'Interactive Wallet',
		'Fully functional standalone wallet. Switch tabs, select accounts, change networks.',
	);
	observer.observe(s1);

	const walletCard = createCard(
		'Standalone Wallet',
		'dev-wallet-standalone',
		'Full wallet with all tabs. Click through to explore.',
		400,
	);
	const walletContainer = el('div', { class: 'standalone-container' });
	const standaloneWallet = document.createElement('dev-wallet-standalone') as DevWalletStandalone;
	standaloneWallet.wallet = wallet;
	walletContainer.appendChild(standaloneWallet);
	getBody(walletCard).appendChild(walletContainer);

	const grid1 = el('div', { class: 'showcase-grid' });
	grid1.appendChild(walletCard);
	s1.appendChild(grid1);
	app.appendChild(s1);

	// -- Section 2: Integration Flows -----------------------------------------

	const s2 = createSection(
		'flows',
		'Integration Flows',
		'The dialogs dApps trigger: connection requests and signing approval.',
	);
	observer.observe(s2);

	// Connection subgroup
	const connGroup = createSubgroup('Connection');
	const connGrid = el('div', { class: 'showcase-grid' });

	const connectCard = createCard(
		'With App Info',
		'dev-wallet-connect',
		'App name + URL shown to user',
		380,
	);
	const connect = document.createElement('dev-wallet-connect') as any;
	connect.appName = 'Cetus DEX';
	connect.appUrl = 'https://app.cetus.zone';
	connect.accounts = MOCK_ACCOUNTS;
	getBody(connectCard).appendChild(connect);
	connGrid.appendChild(connectCard);

	const connectMinCard = createCard(
		'Minimal',
		'dev-wallet-connect',
		'No app metadata provided',
		380,
	);
	const connectMin = document.createElement('dev-wallet-connect') as any;
	connectMin.accounts = MOCK_ACCOUNTS.slice(0, 1);
	getBody(connectMinCard).appendChild(connectMin);
	connGrid.appendChild(connectMinCard);

	connGroup.appendChild(connGrid);
	s2.appendChild(connGroup);

	// Signing subgroup
	const signGroup = createSubgroup('Signing');
	const signGrid = el('div', { class: 'showcase-grid' });

	const msgCard = createCard(
		'Personal Message',
		'dev-wallet-signing',
		'Message signing approval',
		380,
	);
	const signingMsg = document.createElement('dev-wallet-signing') as any;
	signingMsg.request = MOCK_MESSAGE_REQUEST;
	signingMsg.client = null;
	signingMsg.style.height = '380px';
	getBody(msgCard).appendChild(signingMsg);
	signGrid.appendChild(msgCard);

	const txCard = createCard(
		'Transaction',
		'dev-wallet-signing',
		'Transaction signing with analysis',
		380,
	);
	const signingTx = document.createElement('dev-wallet-signing') as any;
	signingTx.request = MOCK_SIGNING_REQUEST;
	signingTx.client = null;
	signingTx.style.height = '380px';
	getBody(txCard).appendChild(signingTx);
	signGrid.appendChild(txCard);

	signGroup.appendChild(signGrid);
	s2.appendChild(signGroup);
	app.appendChild(s2);

	// -- Section 3: Component Reference ---------------------------------------

	const s3 = createSection(
		'components',
		'Component Reference',
		'Individual building blocks. Each shown with its custom element tag.',
	);
	observer.observe(s3);

	// Controls subgroup
	const controlsGroup = createSubgroup('Controls');
	const controlsGrid = el('div', { class: 'showcase-grid' });

	const selectorCard = createCard(
		'Account Selector',
		'dev-wallet-account-selector',
		'Switch between accounts',
		380,
	);
	const selector = document.createElement('dev-wallet-account-selector') as any;
	selector.accounts = accounts;
	selector.adapters = [...wallet.adapters];
	selector.activeAddress = accounts[0]?.address ?? '';
	selector.style.display = 'block';
	selector.style.padding = '16px';
	getBody(selectorCard).appendChild(selector);
	controlsGrid.appendChild(selectorCard);

	const badgeCard = createCard(
		'Network Badge',
		'dev-wallet-network-badge',
		'Network selector dropdown',
		280,
	);
	const badge = document.createElement('dev-wallet-network-badge') as any;
	badge.active = 'testnet';
	badge.networks = ['devnet', 'testnet', 'localnet'];
	badge.style.display = 'block';
	badge.style.padding = '16px';
	getBody(badgeCard).appendChild(badge);
	controlsGrid.appendChild(badgeCard);

	const tabCard = createCard(
		'Tab Bar',
		'dev-wallet-tab-bar',
		'Section navigation',
		380,
	);
	const tabBar = document.createElement('dev-wallet-tab-bar') as any;
	tabBar.active = 'assets';
	getBody(tabCard).appendChild(tabBar);
	controlsGrid.appendChild(tabCard);

	controlsGroup.appendChild(controlsGrid);
	s3.appendChild(controlsGroup);

	// Data Display subgroup
	const dataGroup = createSubgroup('Data Display');
	const dataGrid = el('div', { class: 'showcase-grid' });

	const balancesCard = createCard(
		'Balances',
		'dev-wallet-balances',
		'Coin balances from RPC',
		380,
	);
	const balances = document.createElement('dev-wallet-balances') as any;
	balances.address = accounts[0]?.address ?? '';
	balances.client = wallet.activeClient;
	balances.style.display = 'block';
	balances.style.padding = '16px';
	getBody(balancesCard).appendChild(balances);
	dataGrid.appendChild(balancesCard);

	const objectsCard = createCard(
		'Objects',
		'dev-wallet-objects',
		'Owned objects from RPC',
		380,
	);
	const objectsSub = document.createElement('dev-wallet-objects') as any;
	objectsSub.address = accounts[0]?.address ?? '';
	objectsSub.client = wallet.activeClient;
	objectsSub.style.display = 'block';
	objectsSub.style.padding = '16px';
	getBody(objectsCard).appendChild(objectsSub);
	dataGrid.appendChild(objectsCard);

	dataGroup.appendChild(dataGrid);
	s3.appendChild(dataGroup);

	// Management subgroup
	const mgmtGroup = createSubgroup('Management');
	const mgmtGrid = el('div', { class: 'showcase-grid' });

	const accountsCard = createCard(
		'Account List',
		'dev-wallet-accounts',
		'CRUD operations on accounts',
		420,
	);
	const accountsList = document.createElement('dev-wallet-accounts') as any;
	accountsList.accounts = accounts;
	accountsList.adapters = [...wallet.adapters];
	accountsList.activeAddress = accounts[0]?.address ?? '';
	accountsList.style.display = 'block';
	accountsList.style.padding = '16px';
	getBody(accountsCard).appendChild(accountsList);
	mgmtGrid.appendChild(accountsCard);

	const settingsCard = createCard(
		'Settings',
		'dev-wallet-settings',
		'Networks, accounts, bookmarklet, about',
		420,
	);
	const settings = document.createElement('dev-wallet-settings') as any;
	settings.wallet = wallet;
	settings.accounts = accounts;
	settings.adapters = [...wallet.adapters];
	settings.activeAddress = accounts[0]?.address ?? '';
	settings.style.display = 'block';
	settings.style.padding = '16px';
	settings.style.maxHeight = '500px';
	settings.style.overflowY = 'auto';
	getBody(settingsCard).appendChild(settings);
	mgmtGrid.appendChild(settingsCard);

	mgmtGroup.appendChild(mgmtGrid);
	s3.appendChild(mgmtGroup);

	app.appendChild(s3);

	// -- Live FAB (actual floating button, not in a card) ---------------------

	const panel = document.createElement('dev-wallet-panel') as any;
	panel.wallet = wallet;
	document.body.appendChild(panel);
}

buildShowcase().catch(console.error);
