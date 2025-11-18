/** @jsxImportSource react */
import {
	Body,
	Button,
	Container,
	Head,
	Hr,
	Html,
	Preview,
	Section,
	Tailwind,
	Text,
} from "@react-email/components";

interface EmailVerificationTemplateProps {
	token: string;
}

const baseUrl = process.env.BASE_URL;

export const EmailVerificationTemplate = ({
	token,
}: EmailVerificationTemplateProps) => (
	<Html>
		<Head />
		<Tailwind>
			<Body className="bg-white">
				<Preview>Verifikasi email Anda untuk melanjutkan.</Preview>
				<Container className="mx-auto py-5 pb-12 px-5">
					<Text className="text-[16px] leading-[26px]">Halo,</Text>
					<Text className="text-[16px] leading-[26px]">
						Klik tombol di bawah ini untuk verifikasi email Anda.
					</Text>
					<Section className="text-center">
						<Button
							className="bg-[#5F51E8] rounded-[3px] text-white text-[16px] no-underline text-center block p-3"
							href={`${baseUrl}/auth/verify-email?token=${token}`}
						>
							Verifikasi Email
						</Button>
					</Section>
					<Text className="text-[16px] leading-[26px]">
						Salam,
						<br />
						Tim Hono Bun
					</Text>
					<Hr className="border-[#cccccc] my-5" />
					<Text className="text-[#8898aa] text-[12px]">
						Banjarbaru, Kalimantan Selatan, Indonesia
					</Text>
				</Container>
			</Body>
		</Tailwind>
	</Html>
);

export default EmailVerificationTemplate;
