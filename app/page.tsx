import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">
            HL7 Explorer
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-12">
            Parse, inspect, and create HL7 v2 messages with ease
          </p>

          <div className="grid md:grid-cols-2 gap-6 mb-16">
            <Link
              href="/inspect"
              className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg hover:shadow-xl transition-shadow border-2 border-blue-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-gray-500"
            >
              <div className="text-4xl mb-4">🔍</div>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
                Inspect HL7 Message
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Paste an HL7 message and view it in multiple formats: raw, tree, and table views
              </p>
            </Link>

            <Link
              href="/create"
              className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg hover:shadow-xl transition-shadow border-2 border-green-200 dark:border-gray-700 hover:border-green-400 dark:hover:border-gray-500"
            >
              <div className="text-4xl mb-4">➕</div>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
                Create HL7 Message
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Build MDM^T02 messages step-by-step using structured forms
              </p>
            </Link>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Roadmap
            </h3>
            <div className="text-left space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-green-500 font-bold">✓</span>
                <span className="text-gray-700 dark:text-gray-300">
                  MDM^T02 messages (Current)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-400">○</span>
                <span className="text-gray-500 dark:text-gray-400">
                  ADT messages (Coming soon)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-400">○</span>
                <span className="text-gray-500 dark:text-gray-400">
                  ORM, ORU, DFT messages (Planned)
                </span>
              </div>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Created by{" "}
              <a
                href="https://www.linkedin.com/in/metourni-noureddine/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
              >
                Metourni Noureddine
              </a>
              <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                CEO
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

