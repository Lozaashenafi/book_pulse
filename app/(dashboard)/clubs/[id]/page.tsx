import ClubDiscussion from "@/components/clubs/ClubDiscussion";
import React from "react";

function page() {
  return (
    <>
      <ClubDiscussion params={{ id: "123" }} />
    </>
  );
}

export default page;
