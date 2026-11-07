import { Capacitor } from "@capacitor/core";
import { Contacts } from "@capacitor/contacts";

export type PickedConnectionContact = {
  name?: string;
  phone?: string;
  email?: string;
};

type WebContactPickerNavigator = Navigator & {
  contacts?: {
    select: (
      properties: Array<"name" | "tel" | "email">,
      options?: { multiple?: boolean },
    ) => Promise<Array<{ name?: string[]; tel?: string[]; email?: string[] }>>;
  };
};

export async function pickConnectionContacts(): Promise<{
  status: "selected" | "cancelled" | "unsupported";
  contacts: PickedConnectionContact[];
}> {
  const platform = Capacitor.getPlatform();
  if (platform === "android") {
    // The current Capacitor Contacts plugin requests READ_CONTACTS on Android
    // even for a single picked contact. Soul Codex keeps Android contact import
    // permissionless and falls back to the existing manual name/phone flow.
    return { status: "unsupported", contacts: [] };
  }

  if (platform === "ios") {
    try {
      const contact = await Contacts.pickContact();
      const name = contact.displayName ?? contact.name?.formatted ?? contact.nickname;
      return {
        status: "selected",
        contacts: [{
          ...(name ? { name } : {}),
          ...(contact.phoneNumbers?.[0]?.value ? { phone: contact.phoneNumbers[0].value } : {}),
          ...(contact.emails?.[0]?.value ? { email: contact.emails[0].value } : {}),
        }],
      };
    } catch (error) {
      const code = typeof error === "object" && error && "code" in error ? String((error as { code?: unknown }).code) : "";
      if (code === "OS-PLUG-CONT-0006") return { status: "cancelled", contacts: [] };
      throw error;
    }
  }

  const picker = navigator as WebContactPickerNavigator;
  if (!picker.contacts?.select) return { status: "unsupported", contacts: [] };
  try {
    const selected = await picker.contacts.select(["name", "tel", "email"], { multiple: true });
    return {
      status: selected.length ? "selected" : "cancelled",
      contacts: selected.map(contact => ({
        name: contact.name?.[0],
        phone: contact.tel?.[0],
        email: contact.email?.[0],
      })),
    };
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") return { status: "cancelled", contacts: [] };
    throw error;
  }
}
