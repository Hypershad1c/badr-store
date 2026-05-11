import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { type, data } = body;

    if (type === "order.created") {
      const { orderId, userId, total, items } = data;

      // Create notification for admin users
      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
      const adminResponse = await fetch(`${supabaseUrl}/rest/v1/profiles?role=eq.ADMIN&select=id`, {
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
        },
      });
      const admins = await adminResponse.json();

      if (admins && admins.length > 0) {
        const notifications = admins.map((admin: { id: string }) => ({
          user_id: admin.id,
          title: "New Order Received",
          message: `Order #${orderId?.slice(0, 8) || "unknown"} for $${total || "0.00"} has been placed.`,
          read: false,
        }));

        await fetch(`${supabaseUrl}/rest/v1/notifications`, {
          method: "POST",
          headers: {
            apikey: supabaseKey,
            Authorization: `Bearer ${supabaseKey}`,
            "Content-Type": "application/json",
            Prefer: "return=minimal",
          },
          body: JSON.stringify(notifications),
        });
      }

      // Log activity
      await fetch(`${supabaseUrl}/rest/v1/activity_logs`, {
        method: "POST",
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
          "Content-Type": "application/json",
          Prefer: "return=minimal",
        },
        body: JSON.stringify({
          user_id: userId,
          action: "ORDER_CREATED",
          entity: "order",
          details: { orderId, total },
        }),
      });
    }

    if (type === "virtual_request.created") {
      const { requestId, userId, productId } = data;

      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

      // Notify business managers
      const bmResponse = await fetch(`${supabaseUrl}/rest/v1/profiles?role=eq.BUSINESS_MANAGER&select=id`, {
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
        },
      });
      const managers = await bmResponse.json();

      if (managers && managers.length > 0) {
        const notifications = managers.map((mgr: { id: string }) => ({
          user_id: mgr.id,
          title: "New Service Request",
          message: `A new virtual service request has been submitted. Request #${requestId?.slice(0, 8) || "unknown"}`,
          read: false,
        }));

        await fetch(`${supabaseUrl}/rest/v1/notifications`, {
          method: "POST",
          headers: {
            apikey: supabaseKey,
            Authorization: `Bearer ${supabaseKey}`,
            "Content-Type": "application/json",
            Prefer: "return=minimal",
          },
          body: JSON.stringify(notifications),
        });
      }
    }

    return new Response(
      JSON.stringify({ received: true }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
