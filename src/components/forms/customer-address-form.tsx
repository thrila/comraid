"use client";
import { SubmitHandler, useForm } from "react-hook-form";
import { useMemo } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toastFirstError } from "@/lib/form-errors";
import { customerAddressSchema } from "@/lib/form-schema";
import { Button } from "../button/button";
import { useAddAddressMutation } from "@/lib/api/auth";
import { apiErrorMessage } from "@/lib/api/base";
import { toast } from "react-toastify";
export type customerAddressFormFields = z.infer<typeof customerAddressSchema>;

const CustomerAddressForm = ({ onSaved }: { onSaved?: () => void }) => {
  const [addAddress] = useAddAddressMutation();

  const schema = useMemo(() => customerAddressSchema, []);
  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<customerAddressFormFields>({
    resolver: zodResolver(schema),
  });

  const onSubmit: SubmitHandler<customerAddressFormFields> = async (data) => {
    // Leave optional fields out rather than sending empty strings.
    const optional = (value?: string) => (value?.trim() ? value.trim() : undefined);
    try {
      await addAddress({
        ...data,
        additional_phone: optional(data.additional_phone),
        state: optional(data.state),
        additional_information: optional(data.additional_information),
      }).unwrap();
      toast.success("Address added successfully");
      reset();
      onSaved?.();
    } catch (error) {
      const status = (error as { status?: number })?.status;
      toast.error(
        status === 401
          ? "Log in to save addresses"
          : apiErrorMessage(error, "Failed to save the address. Please try again."),
      );
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit, toastFirstError)}
      className="w-full flex flex-col gap-5"
    >
      <div className="w-full flex flex-row gap-3">
        <input
          type="text"
          {...register("first_name", { required: true })}
          className="w-full py-3 px-2 border focus:outline-none placeholder:text-ash"
          placeholder="First Name"
        />
        <input
          type="text"
          {...register("last_name", { required: true })}
          className="w-full py-3 px-2 border focus:outline-none placeholder:text-ash"
          placeholder="Last Name"
        />
      </div>
      <div className="w-full flex flex-row gap-3">
        <input
          type="text"
          {...register("phone", { required: true })}
          className="w-full py-3 px-2 border focus:outline-none placeholder:text-ash"
          placeholder="Phone Number"
        />
        <input
          type="text"
          {...register("state")}
          className="w-full py-3 px-2 border focus:outline-none placeholder:text-ash"
          placeholder="State"
        />
      </div>
      <div className="w-full flex flex-row gap-3">
        <input
          type="text"
          {...register("additional_phone")}
          className="w-full py-3 px-2 border focus:outline-none placeholder:text-ash"
          placeholder="Additional Number(optional)"
        />
        <input
          type="text"
          {...register("city", { required: true })}
          className="w-full py-3 px-2 border focus:outline-none placeholder:text-ash"
          placeholder="City"
        />
      </div>
      <div className="w-full">
        <input
          type="text"
          {...register("address", { required: true })}
          className="w-full py-3 px-2 border focus:outline-none placeholder:text-ash"
          placeholder="Address"
        />
      </div>
      <div className="w-full">
        <input
          type="text"
          {...register("additional_information", { required: false })}
          className="w-full py-3 px-2 border focus:outline-none placeholder:text-ash"
          placeholder="Additional Information"
        />
      </div>
      <div className="w-full justify-end items-center flex flex-row ">
        <Button variant={"default"} size={"card"} disabled={isSubmitting}>
          {isSubmitting ? "SAVING..." : "Save"}
        </Button>
      </div>
    </form>
  );
};

export default CustomerAddressForm;
