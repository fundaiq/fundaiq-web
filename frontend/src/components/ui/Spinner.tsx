// components/ui/Spinner.tsx
export default function Spinner() {
  return (
    <div className="flex justify-center items-center">
      <div className="w-5 h-5 border-2 border-t-transparent border-blue-600 rounded-full animate-spin" />
    </div>
  );
}
