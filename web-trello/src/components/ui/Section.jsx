export default function Section({ title, description, right, children }) {
  return (
    <section className="mt-8">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[color:rgb(60,60,80)] dark:text-[color:#bba3f9] transition-colors duration-300">
  {title}
</h2>

{description && (
  <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1 transition-colors duration-300">
    {description}
  </p>
)}



        </div>
        {right}
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}
