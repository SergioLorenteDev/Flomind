export default function Input({ label, type = "text", name, placeholder, register, required }) {
  return (
    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
      {label}
      <input
        type={type}
        {...(register ? register(name, { required }) : {})}
        placeholder={placeholder}
        className="
          mt-1 w-full rounded-xl border border-neutral-300 dark:border-neutral-700
          bg-white dark:bg-[#2a2435]
          text-neutral-900 dark:text-neutral-100
          placeholder-neutral-400 dark:placeholder-neutral-500
          px-3 py-2 outline-none
          focus:border-violet-500 dark:focus:border-violet-400
          focus:ring-4 focus:ring-violet-100 dark:focus:ring-violet-900
          transition-colors duration-300
        "
      />
    </label>
  );
}
