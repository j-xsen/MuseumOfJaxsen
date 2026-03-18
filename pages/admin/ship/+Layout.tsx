import { ReactNode } from "react";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body {
          background-color: #0d0d0d;
          color: #e8e0d4;
          font-family: "Georgia", "Times New Roman", serif;
          min-height: 100vh;
        }
        input::placeholder { color: #3a3428; }
        select option { background-color: #111008; }
      `}</style>
      {children}
    </>
  );
}
