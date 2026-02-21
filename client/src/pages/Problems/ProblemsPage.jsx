import { Link } from "react-router-dom";

import { PROBLEMS } from "../../data/problems.js";
import { ChevronRightIcon, Code2Icon } from "lucide-react";
import { getDifficultyBadgeClass } from "../../lib/utils.js";

function ProblemsPage() {
  const problems = Object.values(PROBLEMS);

  const easyProblemsCount = problems.filter(
    (p) => p.difficulty === "Easy"
  ).length;
  const mediumProblemsCount = problems.filter(
    (p) => p.difficulty === "Medium"
  ).length;
  const hardProblemsCount = problems.filter(
    (p) => p.difficulty === "Hard"
  ).length;

  return (
    <div className="min-h-screen bg-base-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 md:py-12">
        {/* HEADER */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 mt-16 sm:mt-20 md:mt-24">Practice Problems</h1>
          <p className="text-sm sm:text-base text-base-content/70">
            Sharpen your coding skills with these curated problems
          </p>
        </div>

        {/* PROBLEMS LIST */}
        <div className="space-y-4">
          {problems.map((problem) => (
            <Link
              key={problem.id}
              to={`/problem/${problem.id}`}
              className="card bg-base-100 hover:scale-[1.01] transition-transform"
            >
              <div className="card-body p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
                  {/* LEFT SIDE */}
                  <div className="flex-1 min-w-0 w-full sm:w-auto">
                    <div className="flex items-start sm:items-center gap-2 sm:gap-3 mb-2">
                      <div className="size-10 sm:size-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Code2Icon className="size-5 sm:size-6 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1">
                          <h2 className="text-lg sm:text-xl font-bold truncate">{problem.title}</h2>
                          <span
                            className={`badge text-xs sm:text-sm ${getDifficultyBadgeClass(
                              problem.difficulty
                            )}`}
                          >
                            {problem.difficulty}
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm text-base-content/60">
                          {problem.category}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm sm:text-base text-base-content/80 mb-2 sm:mb-3 line-clamp-2 sm:line-clamp-none">
                      {problem.description.text}
                    </p>
                  </div>
                  {/* RIGHT SIDE */}

                  <div className="flex items-center gap-2 text-primary self-end sm:self-auto">
                    <span className="font-medium text-sm sm:text-base">Solve</span>
                    <ChevronRightIcon className="size-4 sm:size-5" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* STATS FOOTER */}
        <div className="mt-12 card bg-base-100 shadow-lg">
          <div className="card-body">
            <div className="stats stats-vertical lg:stats-horizontal">
              <div className="stat">
                <div className="stat-title">Total Problems</div>
                <div className="stat-value text-primary">{problems.length}</div>
              </div>

              <div className="stat">
                <div className="stat-title">Easy</div>
                <div className="stat-value text-success">
                  {easyProblemsCount}
                </div>
              </div>
              <div className="stat">
                <div className="stat-title">Medium</div>
                <div className="stat-value text-warning">
                  {mediumProblemsCount}
                </div>
              </div>
              <div className="stat">
                <div className="stat-title">Hard</div>
                <div className="stat-value text-error">{hardProblemsCount}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
export default ProblemsPage;
