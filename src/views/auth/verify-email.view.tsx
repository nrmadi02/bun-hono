/** @jsxImportSource hono/jsx */

import type { FC, PropsWithChildren } from "hono/jsx";

const Layout: FC<PropsWithChildren> = (props) => {
	return (
		<html lang="en">
			<head>
				<meta charset="UTF-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1.0" />
				<title>Verify Email - Bun Hono</title>
				<link rel="stylesheet" href="/static/styles/global.css" />
			</head>
			<body>{props.children}</body>
		</html>
	);
};

interface VerifyEmailViewProps {
	success?: boolean;
	message?: string;
}

export const VerifyEmailView = ({ success, message }: VerifyEmailViewProps = {}) => {
	const isSuccess = success === true;
	const displayMessage =
		message ||
		(isSuccess
			? "Email berhasil diverifikasi!"
			: "Terjadi kesalahan saat memverifikasi email.");

	return (
		<Layout>
			<div class="min-h-screen bg-linear-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
				<div class="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 md:p-10">
					{/* Icon Container */}
					<div class="flex justify-center mb-6">
						<div
							class={`w-20 h-20 rounded-full flex items-center justify-center ${
								isSuccess
									? "bg-green-50"
									: "bg-red-50"
							}`}
						>
							{isSuccess ? (
								<svg
									class="w-10 h-10 text-green-600"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
									xmlns="http://www.w3.org/2000/svg"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M5 13l4 4L19 7"
									/>
								</svg>
							) : (
								<svg
									class="w-10 h-10 text-red-600"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
									xmlns="http://www.w3.org/2000/svg"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M6 18L18 6M6 6l12 12"
									/>
								</svg>
							)}
						</div>
					</div>

					{/* Title */}
					<h1 class="text-2xl md:text-3xl font-bold text-center mb-3 text-gray-900">
						{isSuccess ? "Verifikasi Berhasil!" : "Verifikasi Gagal"}
					</h1>

					{/* Message */}
					<p class="text-gray-600 text-center mb-8 leading-relaxed">
						{displayMessage}
					</p>

					{/* Action Button */}
					{isSuccess ? (
						<a
							href="/auth/login"
							class="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-center block"
						>
							Masuk ke Akun
						</a>
					) : (
						<div class="space-y-3">
							<a
								href="/auth/login"
								class="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-center block"
							>
								Kembali ke Login
							</a>
							<button
								type="button"
								class="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-4 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
							>
								Kirim Ulang Email Verifikasi
							</button>
						</div>
					)}
				</div>
			</div>
		</Layout>
	);
};
