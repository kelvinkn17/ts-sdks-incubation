// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

import { css } from 'lit';

const resetStyles = css`
	* {
		box-sizing: border-box;
		-webkit-font-smoothing: antialiased;
		font-family: var(--dev-wallet-font-sans);
	}

	button {
		appearance: none;
		background-color: transparent;
		font-size: inherit;
		font-family: inherit;
		color: inherit;
		border: 0;
		padding: 0;
		margin: 0;
		cursor: pointer;
		outline-color: rgba(0, 178, 255, 0.4);
	}

	p,
	h1,
	h2,
	h3 {
		margin: 0;
		color: var(--dev-wallet-foreground);
	}

	:focus-visible {
		outline: 2px solid var(--dev-wallet-ring);
		outline-offset: 2px;
	}
`;

/**
 * Theme variables use a two-layer approach:
 * - `themeDefaults` sets fallback values on :host (only matters for top-level components)
 * - Top-level components (standalone, panel) override with :host([theme='light']) for light mode
 * - Child components inherit variables from the parent through Shadow DOM, so they must NOT
 *   redefine them. Child components only include `sharedStyles` (reset + typography, no color vars).
 */
export const themeVars = css`
	:host {
		/* Colors: neutral dark (default) */
		--dev-wallet-background: #1c1c1e;
		--dev-wallet-foreground: #f5f5f5;
		--dev-wallet-primary: #00b2ff;
		--dev-wallet-primary-foreground: #ffffff;
		--dev-wallet-secondary: #2c2c2e;
		--dev-wallet-secondary-foreground: #f5f5f5;
		--dev-wallet-muted: #2c2c2e;
		--dev-wallet-muted-foreground: rgba(255, 255, 255, 0.5);
		--dev-wallet-tertiary: rgba(255, 255, 255, 0.3);
		--dev-wallet-destructive: #ff2b3a;
		--dev-wallet-positive: #00bc7e;
		--dev-wallet-warning: #ff9905;
		--dev-wallet-border: rgba(255, 255, 255, 0.08);
		--dev-wallet-border-med: rgba(255, 255, 255, 0.1);
		--dev-wallet-input: rgba(255, 255, 255, 0.08);
		--dev-wallet-ring: #00b2ff;
		--dev-wallet-status-connected: #00bc7e;
		--dev-wallet-status-disconnected: rgba(255, 255, 255, 0.3);
		--dev-wallet-hover: rgba(255, 255, 255, 0.06);
		--dev-wallet-active: rgba(255, 255, 255, 0.1);

		/* Radius */
		--dev-wallet-radius: 12px;
		--dev-wallet-radius-xs: 6px;
		--dev-wallet-radius-sm: 8px;
		--dev-wallet-radius-md: 10px;
		--dev-wallet-radius-xl: 16px;
		--dev-wallet-radius-2xs: 3px;

		/* Shadows */
		--dev-wallet-shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.2);
		--dev-wallet-shadow-md: 0 4px 12px rgba(0, 0, 0, 0.3);
		--dev-wallet-shadow-lg: 0 8px 32px rgba(0, 0, 0, 0.28),
			0 0 0 1px rgba(255, 255, 255, 0.05);
	}

	/* Light theme */
	:host([theme='light']) {
		--dev-wallet-background: #f7f7f5;
		--dev-wallet-foreground: #1a1a1a;
		--dev-wallet-primary: #00b2ff;
		--dev-wallet-primary-foreground: #ffffff;
		--dev-wallet-secondary: #f0efed;
		--dev-wallet-secondary-foreground: #1a1a1a;
		--dev-wallet-muted: #f0efed;
		--dev-wallet-muted-foreground: rgba(0, 0, 0, 0.4);
		--dev-wallet-tertiary: rgba(0, 0, 0, 0.25);
		--dev-wallet-destructive: #ff2b3a;
		--dev-wallet-positive: #00bc7e;
		--dev-wallet-warning: #ff9905;
		--dev-wallet-border: rgba(0, 0, 0, 0.06);
		--dev-wallet-border-med: rgba(0, 0, 0, 0.08);
		--dev-wallet-input: rgba(0, 0, 0, 0.06);
		--dev-wallet-ring: #00b2ff;
		--dev-wallet-status-connected: #00bc7e;
		--dev-wallet-status-disconnected: rgba(0, 0, 0, 0.25);
		--dev-wallet-shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.06);
		--dev-wallet-shadow-md: 0 4px 12px rgba(0, 0, 0, 0.08);
		--dev-wallet-shadow-lg: 0 0 0 1px rgba(0, 0, 0, 0.06), 0 8px 24px rgba(0, 0, 0, 0.12);
		--dev-wallet-hover: rgba(0, 0, 0, 0.04);
		--dev-wallet-active: rgba(0, 0, 0, 0.07);
	}
`;

const typographyStyles = css`
	:host {
		/* Typography */
		--dev-wallet-font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
			Helvetica, Arial, sans-serif;
		--dev-wallet-font-weight-medium: 500;
		--dev-wallet-font-weight-semibold: 600;
		--dev-wallet-font-mono: 'SF Mono', 'Fira Code', 'Fira Mono', Menlo, Consolas, monospace;
		--dev-wallet-text-2xs: 10px;
		--dev-wallet-text-xs: 11px;
		--dev-wallet-text-sm: 12px;
		--dev-wallet-text-base: 13px;
		--dev-wallet-text-md: 14px;
		--dev-wallet-text-lg: 15px;
		--dev-wallet-text-xl: 16px;
		letter-spacing: -0.01em;
	}
`;

export const dropdownItemStyles = css`
	.dropdown-item {
		display: flex;
		align-items: center;
		gap: 8px;
		width: 100%;
		padding: 8px 10px;
		font-size: 12px;
		color: var(--dev-wallet-foreground);
		text-align: left;
		border-radius: var(--dev-wallet-radius-sm);
	}

	.dropdown-item:hover {
		background: var(--dev-wallet-hover);
	}

	.dropdown-item[aria-selected='true'] {
		font-weight: var(--dev-wallet-font-weight-medium);
		color: var(--dev-wallet-foreground);
	}
`;

export const connectDialogStyles = css`
	.connect-dialog {
		width: 360px;
		max-height: min(600px, 80vh);
		border-radius: var(--dev-wallet-radius-xl);
		background: var(--dev-wallet-background);
		box-shadow: var(--dev-wallet-shadow-lg);
		overflow: hidden;
		display: flex;
		flex-direction: column;
		padding: 0;
		color: inherit;
	}

	.connect-dialog::backdrop {
		background: rgba(0, 0, 0, 0.5);
	}

	.connect-dialog-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 16px 20px;
		border-bottom: 1px solid var(--dev-wallet-border);
	}

	.connect-dialog-title {
		font-size: 16px;
		font-weight: var(--dev-wallet-font-weight-semibold);
		color: var(--dev-wallet-foreground);
	}
`;

export const actionBarStyles = css`
	.address-bar {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 6px;
		padding: 8px 0 4px;
	}

	.address-text {
		font-size: 12px;
		font-family: var(--dev-wallet-font-mono);
		color: var(--dev-wallet-tertiary);
	}

	.address-copy-btn {
		width: 24px;
		height: 24px;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: var(--dev-wallet-radius-xs);
		font-size: 13px;
		color: var(--dev-wallet-tertiary);
	}

	.address-copy-btn:hover {
		color: var(--dev-wallet-foreground);
	}

	.address-copy-btn.copied {
		color: var(--dev-wallet-positive);
	}

	.action-buttons {
		display: flex;
		justify-content: center;
		gap: 8px;
		padding: 12px 0 20px;
	}

	.action-btn {
		padding: 9px 22px;
		border-radius: 999px;
		font-size: 13px;
		font-weight: var(--dev-wallet-font-weight-medium);
		color: var(--dev-wallet-foreground);
		background: var(--dev-wallet-active);
		transition: background 0.15s;
	}

	.action-btn:hover {
		filter: brightness(0.9);
	}

	.action-btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.action-btn.requesting {
		opacity: 0.6;
	}

	.action-error {
		text-align: center;
		font-size: 12px;
		color: var(--dev-wallet-destructive);
		padding: 0 0 8px;
	}

	/* -- Receive dialog ---------------------------------------------------- */

	.receive-overlay {
		position: fixed;
		inset: 0;
		z-index: 100;
		display: flex;
		align-items: center;
		justify-content: center;
		background: rgba(0, 0, 0, 0.5);
	}

	.receive-card {
		width: 300px;
		padding: 24px;
		border-radius: var(--dev-wallet-radius-xl);
		background: var(--dev-wallet-background);
		box-shadow: var(--dev-wallet-shadow-lg);
		text-align: center;
	}

	.receive-title {
		font-size: 16px;
		font-weight: var(--dev-wallet-font-weight-semibold);
		color: var(--dev-wallet-foreground);
		margin-bottom: 16px;
	}

	.receive-address {
		font-size: 12px;
		font-family: var(--dev-wallet-font-mono);
		color: var(--dev-wallet-muted-foreground);
		word-break: break-all;
		line-height: 1.6;
		padding: 14px 16px;
		border-radius: var(--dev-wallet-radius);
		background: var(--dev-wallet-secondary);
		margin-bottom: 16px;
	}

	.receive-copy-btn {
		padding: 10px 24px;
		border-radius: 999px;
		font-size: 13px;
		font-weight: var(--dev-wallet-font-weight-medium);
		color: var(--dev-wallet-primary-foreground);
		background: var(--dev-wallet-primary);
	}

	.receive-copy-btn:hover {
		filter: brightness(0.9);
	}

	.receive-copy-btn.copied {
		background: var(--dev-wallet-positive);
	}

	.receive-close {
		display: block;
		margin-top: 12px;
		font-size: 13px;
		color: var(--dev-wallet-muted-foreground);
	}

	.receive-close:hover {
		color: var(--dev-wallet-foreground);
	}
`;

export const actionButtonStyles = css`
	.actions {
		display: flex;
		gap: 8px;
	}

	.btn {
		flex: 1;
		padding: 10px 16px;
		border-radius: var(--dev-wallet-radius-md);
		font-size: 13px;
		font-weight: var(--dev-wallet-font-weight-semibold);
		transition: background-color 0.15s;
	}

	.btn-approve {
		background: var(--dev-wallet-primary);
		color: var(--dev-wallet-primary-foreground);
		border-radius: 999px;
	}

	.btn-approve:hover {
		filter: brightness(0.9);
	}

	.btn-reject {
		background: var(--dev-wallet-destructive);
		color: var(--dev-wallet-primary-foreground);
		border-radius: 999px;
	}

	.btn-reject:hover {
		filter: brightness(0.9);
	}

	.btn-cancel {
		background: transparent;
		color: var(--dev-wallet-muted-foreground);
		border: 1px solid var(--dev-wallet-border-med);
		border-radius: 999px;
	}

	.btn-cancel:hover {
		color: var(--dev-wallet-foreground);
		border-color: var(--dev-wallet-border-med);
	}

	.btn-create {
		background: var(--dev-wallet-primary);
		color: var(--dev-wallet-primary-foreground);
		border-radius: 999px;
	}

	.btn-create:hover {
		filter: brightness(0.9);
	}

	.btn-create:disabled,
	.btn-approve:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
`;

export const stateStyles = css`
	.loading,
	.empty-state,
	.error-state {
		text-align: center;
		padding: 32px 16px;
		font-size: 13px;
	}

	.loading {
		color: var(--dev-wallet-tertiary);
	}

	.empty-state {
		color: var(--dev-wallet-tertiary);
	}

	.error-state {
		color: var(--dev-wallet-destructive);
	}
`;

export const sectionHeaderStyles = css`
	.section-header {
		font-size: 11px;
		font-weight: var(--dev-wallet-font-weight-semibold);
		color: var(--dev-wallet-muted-foreground);
		text-transform: uppercase;
		letter-spacing: 0.06em;
		margin-bottom: 10px;
	}
`;

export const settingsToggleStyles = css`
	.setting-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 14px 0;
		border-bottom: 1px solid var(--dev-wallet-border);
	}

	.setting-row:last-child {
		border-bottom: none;
	}

	.setting-label {
		font-size: 14px;
		font-weight: var(--dev-wallet-font-weight-medium);
		color: var(--dev-wallet-foreground);
	}

	.segmented-control {
		display: inline-flex;
		padding: 3px;
		border-radius: var(--dev-wallet-radius-sm);
		background: var(--dev-wallet-active);
		gap: 2px;
	}

	.segment {
		padding: 6px 12px;
		border-radius: var(--dev-wallet-radius-xs);
		font-size: 12px;
		font-weight: var(--dev-wallet-font-weight-medium);
		color: var(--dev-wallet-muted-foreground);
		transition: all 0.15s;
		white-space: nowrap;
	}

	.segment:hover {
		color: var(--dev-wallet-foreground);
	}

	.segment.active {
		background: var(--dev-wallet-foreground);
		color: var(--dev-wallet-background);
		box-shadow: none;
	}
`;

export const balanceDetailStyles = css`
	.balance-detail {
		padding: 0;
	}

	.detail-back {
		display: flex;
		align-items: center;
		gap: 6px;
		font-size: 13px;
		color: var(--dev-wallet-muted-foreground);
		margin-bottom: 20px;
	}

	.detail-back:hover {
		color: var(--dev-wallet-foreground);
	}

	.detail-back svg {
		width: 16px;
		height: 16px;
	}

	.detail-hero {
		text-align: center;
		margin-bottom: 20px;
	}

	.detail-amount {
		font-size: 28px;
		font-weight: var(--dev-wallet-font-weight-semibold);
		color: var(--dev-wallet-foreground);
		font-family: var(--dev-wallet-font-mono);
		font-variant-numeric: tabular-nums;
	}

	.detail-symbol {
		font-size: 16px;
		font-weight: var(--dev-wallet-font-weight-medium);
		color: var(--dev-wallet-muted-foreground);
		margin-left: 6px;
	}

	.detail-coin-type {
		font-size: 12px;
		font-family: var(--dev-wallet-font-mono);
		color: var(--dev-wallet-tertiary);
		margin-top: 4px;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.detail-actions {
		display: flex;
		justify-content: center;
		gap: 8px;
		margin-bottom: 24px;
	}

	.detail-section-label {
		font-size: 11px;
		font-weight: var(--dev-wallet-font-weight-semibold);
		color: var(--dev-wallet-tertiary);
		text-transform: uppercase;
		letter-spacing: 0.05em;
		margin-bottom: 6px;
	}

	.detail-address-row {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.detail-address {
		font-size: 13px;
		font-family: var(--dev-wallet-font-mono);
		color: var(--dev-wallet-muted-foreground);
		flex: 1;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	/* -- Send form ---------------------------------------------------- */

	.send-form {
		margin-top: 20px;
	}

	.send-field {
		margin-bottom: 12px;
	}

	.send-label {
		display: block;
		font-size: 12px;
		font-weight: var(--dev-wallet-font-weight-medium);
		color: var(--dev-wallet-muted-foreground);
		margin-bottom: 4px;
	}

	.send-input {
		width: 100%;
		padding: 10px 12px;
		border-radius: var(--dev-wallet-radius-sm);
		border: 1px solid var(--dev-wallet-border-med);
		background: var(--dev-wallet-secondary);
		color: var(--dev-wallet-foreground);
		font-size: 14px;
		font-family: inherit;
		outline: none;
		box-sizing: border-box;
	}

	.send-input:focus {
		border-color: var(--dev-wallet-primary);
	}

	.send-input::placeholder {
		color: var(--dev-wallet-tertiary);
	}

	.send-actions {
		display: flex;
		gap: 8px;
		margin-top: 16px;
	}

	.send-btn {
		flex: 1;
		padding: 10px;
		border-radius: 999px;
		font-size: 13px;
		font-weight: var(--dev-wallet-font-weight-semibold);
	}

	.send-btn-primary {
		background: var(--dev-wallet-primary);
		color: var(--dev-wallet-primary-foreground);
	}

	.send-btn-primary:disabled {
		opacity: 0.4;
		cursor: not-allowed;
	}

	.send-btn-primary:not(:disabled):hover {
		filter: brightness(0.9);
	}

	.send-btn-cancel {
		background: transparent;
		color: var(--dev-wallet-muted-foreground);
	}

	.send-btn-cancel:hover {
		color: var(--dev-wallet-foreground);
	}

	.send-error {
		font-size: 12px;
		color: var(--dev-wallet-destructive);
		margin-top: 8px;
	}

	.send-success {
		text-align: center;
		padding: 20px;
		font-size: 14px;
		color: var(--dev-wallet-positive);
		font-weight: var(--dev-wallet-font-weight-medium);
	}
`;

const reducedMotionStyles = css`
	@media (prefers-reduced-motion: reduce) {
		*,
		*::before,
		*::after {
			animation-duration: 0.01ms !important;
			animation-iteration-count: 1 !important;
			transition-duration: 0.01ms !important;
		}
	}
`;

/** Shared styles for ALL components (child + top-level). No color vars, just reset + typography. */
export const sharedStyles = [resetStyles, typographyStyles, reducedMotionStyles];
