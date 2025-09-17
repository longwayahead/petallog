import { useState, useEffect } from "react";
import PageHeader from "../../../ui/TopNav";
import { requestPermission, subscribeToPush, unsubscribeFromPush } from "../../../utils/push";

export default function SubscribeToPush() {
  const [status, setStatus] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  useEffect(() => {
    navigator.serviceWorker.ready.then((reg) => {
      reg.pushManager.getSubscription().then((sub) => setSubscribed(!!sub));
    });
  }, []);

  async function enableNotifications() {
    const ok = await requestPermission();
    if (!ok) return;
    // console.log(ok);
    try {
      await subscribeToPush();
      setSubscribed(true);
      setStatus("✅ Notifications enabled!");
    } catch (err) {
      console.error(err);
      setStatus("❌ Subscription failed.");
    }
  }

  async function disableNotifications() {
    try {
      await unsubscribeFromPush();
      setSubscribed(false);
      setStatus("🚫 Notifications disabled.");
    } catch (err) {
      console.error(err);
      setStatus("❌ Failed to unsubscribe.");
    }
  }

  return (
    <main className="app-root app-container mx-auto max-w-md bg-white text-gray-800 pb-16">
      <PageHeader title="Notifications" showBackButton={true} />

      <div className="p-4">
        <p className="mb-4">Enable push notifications to get plant care reminders.</p>
        {subscribed ? (
          <button
            onClick={disableNotifications}
            className="px-4 py-2 bg-red-600 text-white rounded-lg"
          >
            Disable Notifications
          </button>
        ) : (
          <button
            onClick={enableNotifications}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg"
          >
            Enable Notifications
          </button>
        )}
        {status && <p className="mt-4">{status}</p>}
      </div>
    </main>
  );
}
