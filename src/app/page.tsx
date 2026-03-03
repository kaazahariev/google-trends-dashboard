import { Dashboard } from "@/components/Dashboard";

export default function Home() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Google Trends Explorer</h1>
        <p className="mt-1 text-gray-500 dark:text-gray-400">
          Discover what the world is searching for
        </p>
      </div>
      <Dashboard />
    </div>
  );
}
