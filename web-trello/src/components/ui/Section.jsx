export default function Section({ title, description, right, children }) {
  return (
    <section className="mt-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-[color:rgb(60,60,80)] transition-colors duration-300 dark:text-[color:#bba3f9]">
            {title}
          </h2>

          {description && (
            <p className="mt-1 text-sm text-neutral-500 transition-colors duration-300 dark:text-neutral-400">
              {description}
            </p>
          )}
        </div>
        {right ? (
          <div className="flex items-center justify-start sm:justify-end">{right}</div>
        ) : null}
      </div>
      <div className="mt-2">{children}</div>
    </section>
  );
}
