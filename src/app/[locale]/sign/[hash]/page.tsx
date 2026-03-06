import SignPageContent from "./SignPageContent";

export default function SignPage({ params }: { params: { hash: string } }) {
  return <SignPageContent hash={params.hash} />;
}
