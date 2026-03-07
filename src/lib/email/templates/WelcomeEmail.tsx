import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
  Tailwind,
} from "@react-email/components";
import * as React from "react";

interface WelcomeEmailProps {
  userName: string;
  verifyUrl: string;
}

export const WelcomeEmail = ({
  userName,
  verifyUrl,
}: WelcomeEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Köszöntünk a fedélzeten! Kérlek erősítsd meg a fiókodat.</Preview>
      <Tailwind>
        <Body className="bg-gray-50 font-sans">
          <Container className="mx-auto py-10 px-4 max-w-xl">
            <Section className="bg-white rounded-xl shadow-md p-8 text-center border border-gray-100">
              <Heading className="text-2xl font-bold text-gray-900 mb-4">
                Üdvözlünk, {userName || "kedves Vásárlónk"}! 🎵
              </Heading>
              
              <Text className="text-gray-600 text-base mb-6 leading-relaxed">
                Köszönjük, hogy csatlakoztál a Hangakadémia webshopjához és tanulási rendszeréhez! 
                Kérlek, kattints az alábbi gombra az e-mail címed megerősítéséhez és a fiókod aktiválásához.
              </Text>

              <Section className="text-center mt-[32px] mb-[32px]">
                <Button
                  className="bg-[#EA580C] rounded text-white text-[16px] font-semibold no-underline text-center px-6 py-3"
                  href={verifyUrl}
                >
                  Fiók megerősítése
                </Button>
              </Section>
              
              <Text className="text-gray-500 text-sm mt-8">
                Ha a gomb nem működik, másold be az alábbi linket a böngésződbe:<br />
                <a href={verifyUrl} className="text-[#EA580C] underline break-all">{verifyUrl}</a>
              </Text>
              
              <Text className="text-gray-400 text-xs mt-8">
                Ha nem te regisztráltál erre a fiókra, kérlek hagyd figyelmen kívül ezt az e-mailt. Ezt az üzenetet automatikusan küldtük.
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default WelcomeEmail;
