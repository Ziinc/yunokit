// @deno-types="https://esm.sh/@supabase/supabase-js@2.39.3"
import { createClient } from "npm:@supabase/supabase-js@2.39.3";
import { TablesInsert, TablesUpdate } from "../_shared/database.types.ts";
import { handleResponse } from "./_utils.ts";

type SupabaseClient = ReturnType<typeof createClient>;

export const listTickets = async (client: SupabaseClient) => {
  return await client.from("tickets").select().then(handleResponse);
};

export const createTicket = async (
  client: SupabaseClient,
  ticket: TablesInsert<{ schema: "yunofeedback" }, "tickets">,
) => {
  return await client
    .from("tickets")
    .insert(ticket)
    .select()
    .single()
    .then(handleResponse);
};

export const updateTicket = async (
  client: SupabaseClient,
  id: string,
  ticket: TablesUpdate<{ schema: "yunofeedback" }, "tickets">,
) => {
  return await client
    .from("tickets")
    .update(ticket)
    .eq("id", id)
    .select()
    .single()
    .then(handleResponse);
};

export const deleteTicket = async (client: SupabaseClient, id: string) => {
  return await client
    .from("tickets")
    .delete()
    .eq("id", id)
    .then(handleResponse);
};

export const addTicketComment = async (
  client: SupabaseClient,
  comment: TablesInsert<{ schema: "yunofeedback" }, "ticket_comments">,
) => {
  return await client
    .from("ticket_comments")
    .insert(comment)
    .select()
    .single()
    .then(handleResponse);
};

export const listTicketComments = async (
  client: SupabaseClient,
  ticketId: string,
) => {
  return await client
    .from("ticket_comments")
    .select()
    .eq("ticket_id", ticketId)
    .then(handleResponse);
};
