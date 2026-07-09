"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogBody,
  DialogClose,
} from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { CustomerFormFields } from "@/components/customers/CustomerFormFields";

export function NewCustomerModal({ categories }: { categories: string[] }) {
  const router = useRouter();
  const params = useSearchParams();
  const isNew = params.get("new") === "1";

  const close = React.useCallback(() => {
    const next = new URLSearchParams(params.toString());
    next.delete("new");
    const qs = next.toString();
    router.push(qs ? `?${qs}` : "?");
  }, [params, router]);

  React.useEffect(() => {
    if (!isNew) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isNew, close]);

  return (
    <Dialog open={isNew} onOpenChange={(o) => !o && close()}>
      <DialogContent>
        <DialogClose>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M18 6L6 18" />
            <path d="M6 6l12 12" />
          </svg>
        </DialogClose>
        <DialogHeader>Add new customer</DialogHeader>
        <DialogBody>
          <CustomerFormFields
            onCancel={close}
            onSuccess={close}
            submitLabel="Add customer"
            existingCategories={categories}
          />
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
}

export function NewCustomerButton() {
  const router = useRouter();
  const params = useSearchParams();
  return (
    <Button
      variant="primary"
      size="md"
      onClick={() => {
        const next = new URLSearchParams(params.toString());
        next.set("new", "1");
        router.push(`?${next.toString()}`);
      }}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
        <path d="M12 5v14" />
        <path d="M5 12h14" />
      </svg>
      Add customer
    </Button>
  );
}
