export async function subscribeToPush() {
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
    throw new Error("Push not supported");
  }

  const reg = await navigator.serviceWorker.ready;
  let subscription = await reg.pushManager.getSubscription();

  if (!subscription) {
    subscription = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(import.meta.env.VITE_VAPID_PUBLIC_KEY),
    });
  }

  const res = await fetch("/api/push/subscribe", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ subscription }),
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error(`Failed to save subscription: ${res.status}`);
  }

  return subscription;
}


function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, "+")
    .replace(/_/g, "/");
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
}

export async function unsubscribeFromPush() {
  const reg = await navigator.serviceWorker.ready;
  const subscription = await reg.pushManager.getSubscription();
  if (subscription) {
    // Notify server so DB gets cleaned up
    await fetch("/api/push/unsubscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ endpoint: subscription.endpoint }),
    });

    const success = await subscription.unsubscribe();
    console.log("Unsubscribed:", success);
  } else {
    console.log("No existing subscription to remove.");
  }
}
/**
 * Ask the user for permission to send notifications.
 * Returns true if granted, false otherwise.
 */
export async function requestPermission(): Promise<boolean> {
  if (Notification.permission === "granted") {
    console.log("🔔 Notifications already granted");
    return true;
  }

  if (Notification.permission === "denied") {
    alert("Notifications are blocked. Please enable them in your browser's site settings.");
    return false;
  }

  // Only "default" will actually trigger the browser prompt
  const permission = await Notification.requestPermission();
  return permission === "granted";
}
