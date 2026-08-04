import { redirect } from "next/navigation";

export default async function TripRootPage(props: PageProps<"/trips/[tripId]">) {
  const { tripId } = await props.params;
  redirect(`/trips/${tripId}/places`);
}
