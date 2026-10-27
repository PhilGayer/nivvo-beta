// Retired QA endpoint. Official Auth Admin provisioner was removed after setup.
// This deployed handler has no administrative capability and returns no data.
Deno.serve(() => new Response('Gone', {status: 410}));
