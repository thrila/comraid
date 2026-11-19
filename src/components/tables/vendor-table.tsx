import React from "react";
import { Button } from "../button/button";

const VendorTable = () => {
  return (
    <table className="w-full border-x border-b border-ash">
      <thead>
        <tr className="flex justify-between px-5 py-3 text-ash text-md border-y border-ash">
          <td> Username</td>
          <td> Full name</td>
          <td>Email </td>
          <td>Phone</td>
          <td>Date joined</td>
          <td>Status</td>
        </tr>
      </thead>
      <tbody>
        <tr className="flex bg-[#151419] items-center justify-between px-5 py-2 text-light-grey text-sm">
          <td>John Dee</td>
          <td>Jonathan Deeman</td>
          <td>Jonathan@email.com</td>
          <td>+23423234312</td>
          <td>Jan 12, 2024</td>
          <td>
            <Button
              className="border-light-grey border text-light-grey hover:bg-dashboard hover:duration-500 hover:text-light"
              variant={"outline"}
              size={"sm"}
            >
              Switch to buyer
            </Button>
          </td>
        </tr>
      </tbody>
    </table>
  );
};

export default VendorTable;
