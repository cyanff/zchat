<script lang="ts">
	let email = '';
	let password = '';
	let isSubmitting = false;

	/**
	 * Handles form submission animations and state
	 * Provides visual feedback during authentication attempts
	 *
	 * @param {Event} e - The form submission event
	 */
	function handleSubmit(e: SubmitEvent) {
		// Animation state only - actual auth handling is done by the form action
		isSubmitting = true;
		// Reset after a delay to handle cases where navigation might be slow
		setTimeout(() => {
			isSubmitting = false;
		}, 2000);
	}

	/**
	 * Populates the form with test user credentials
	 * Allows quick access for development and testing purposes
	 * without requiring manual credential entry
	 */
	function useTestCredentials() {
		email = 'hello@moecorp.co';
		password = 'someterriblepassword123';
	}
</script>

<div id="content" class="flex-1 w-full">
	<div class="auth-container">
		<header class="header">
			<a href="/" class="flex items-center gap-4 text-lg font-semibold group">
				<img
					src="/zero.png"
					alt="ZChat Logo"
					class="h-8 w-auto invert group-hover:rotate-180 transition duration-300 ease-in-out cursor-pointer"
				/>
				<span class="text-white font-bold display-font text-lg tracking-tight transition-colors"
					>ZChat</span
				>
			</a>
		</header>

		<main class="main-content">
			<div class="auth-card">
				<h1 class="auth-title">Welcome</h1>
				<p class="auth-subtitle">Sign in to continue to ZChat</p>

				<form method="POST" action="?/login" on:submit={handleSubmit} class="auth-form">
					<div class="form-group">
						<label for="email" class="form-label">Email</label>
						<input
							id="email"
							name="email"
							type="email"
							bind:value={email}
							required
							autocomplete="email"
							class="form-input"
							placeholder="you@example.com"
						/>
					</div>

					<div class="form-group">
						<label for="password" class="form-label">Password</label>
						<input
							id="password"
							name="password"
							type="password"
							bind:value={password}
							required
							autocomplete="current-password"
							class="form-input"
							placeholder="••••••••"
						/>
					</div>

					<div class="test-account-container">
						<button
							type="button"
							class="auth-button test-user"
							on:click={useTestCredentials}
							disabled={isSubmitting}
						>
							Use test account
						</button>
					</div>

					<div class="form-actions">
						<button type="submit" class="auth-button primary" disabled={isSubmitting}>
							{isSubmitting ? 'Signing in...' : 'Sign in'}
						</button>

						<button
							type="submit"
							formaction="?/signup"
							class="auth-button secondary"
							disabled={isSubmitting}
						>
							Create account
						</button>
					</div>
				</form>
			</div>
		</main>
	</div>
</div>

<style>
	.auth-container {
		display: flex;
		flex-direction: column;
		height: 100vh;
		box-sizing: border-box;
		background-color: #000;
		color: white;
	}

	.header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 16px 24px;
		width: 100%;
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		z-index: 10;
	}

	.main-content {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 0 20px;
	}

	.auth-card {
		width: 100%;
		max-width: 420px;
		background-color: rgba(255, 255, 255, 0.05);
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 12px;
		padding: 32px;
		box-shadow: 0 4px 24px rgba(0, 0, 0, 0.2);
		backdrop-filter: blur(10px);
		transition:
			transform 0.3s ease,
			box-shadow 0.3s ease;
	}

	.auth-card:hover {
		box-shadow: 0 8px 32px rgba(0, 0, 0, 0.25);
	}

	.auth-title {
		font-size: 2rem;
		font-weight: 600;
		margin-bottom: 8px;
		text-align: center;
		color: white;
	}

	.auth-subtitle {
		font-size: 1rem;
		font-weight: 400;
		color: rgba(255, 255, 255, 0.5);
		margin-bottom: 32px;
		text-align: center;
	}

	.auth-form {
		display: flex;
		flex-direction: column;
		gap: 20px;
		width: 100%;
	}

	.form-group {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.form-label {
		font-size: 0.9rem;
		font-weight: 500;
		color: rgba(255, 255, 255, 0.7);
	}

	.form-input {
		padding: 12px 16px;
		border-radius: 8px;
		border: 1px solid rgba(255, 255, 255, 0.1);
		background-color: rgba(255, 255, 255, 0.07);
		color: white;
		font-size: 1rem;
		width: 100%;
		box-sizing: border-box;
		transition: all 0.2s ease;
	}

	.form-input:focus {
		outline: none;
		border-color: rgba(255, 255, 255, 0.3);
		background-color: rgba(255, 255, 255, 0.1);
		box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.1);
	}

	.form-input::placeholder {
		color: rgba(255, 255, 255, 0.3);
	}

	.form-actions {
		display: flex;
		flex-direction: column;
		gap: 12px;
		margin-top: 8px;
	}

	.auth-button {
		padding: 12px 20px;
		border-radius: 8px;
		font-size: 1rem;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s ease;
		border: none;
		width: 100%;
	}

	.auth-button:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.primary {
		background-color: rgba(255, 255, 255, 0.9);
		color: #000;
	}

	.primary:hover:not(:disabled) {
		background-color: white;
	}

	.secondary {
		background-color: transparent;
		border: 1px solid rgba(255, 255, 255, 0.2);
		color: white;
	}

	.secondary:hover:not(:disabled) {
		background-color: rgba(255, 255, 255, 0.1);
		border-color: rgba(255, 255, 255, 0.3);
	}

	.test-account-container {
		display: flex;
		justify-content: flex-start;
		margin-bottom: 12px;
	}

	.test-user {
		background-color: transparent;
		color: rgba(245, 35, 136, 0.9);
		font-size: 0.9rem;
		border: none;
		position: relative;
		overflow: hidden;
		transition: all 0.3s ease;
		text-decoration: underline;
		padding: 4px 0;
		margin: 0;
		width: auto;
	}

	.test-user:hover:not(:disabled) {
		background-color: transparent;
		color: rgba(245, 35, 136, 1);
		text-decoration: underline;
		box-shadow: none;
	}

	.test-user:active:not(:disabled) {
		box-shadow: none;
	}

	.test-user:disabled {
		background-color: transparent;
		color: rgba(245, 35, 136, 0.5);
		border: none;
	}

	@media (max-width: 480px) {
		.auth-card {
			padding: 24px;
		}
	}
</style>
