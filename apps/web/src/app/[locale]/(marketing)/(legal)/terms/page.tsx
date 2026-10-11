import { LegalPage, legalMetadata } from '../_components/legal-page';

export const generateMetadata = () => legalMetadata('terms');

export default function Page() {
  return <LegalPage slug="terms" />;
}
