import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { baseLinen } from '@/config';
import { callbackUrl, openExternal } from '@/di';
import LinenLogo from '@linen/ui/LinenLogo';

export default function SignIn() {
  const location = useLocation();
  const [from] = useState(() => {
    let from = location.state?.from?.pathname || '/';
    localStorage.setItem('from', from);
    return from;
  });

  useEffect(() => {
    let timerId = setTimeout(() => redirectToSignIn(), 1000);
    return () => {
      clearTimeout(timerId);
    };
  }, []);

  return (
    <div className="flex flex-col items-center gap-10 justify-center min-h-screen">
      <LinenLogo />

      <p>You must sign in to view the page at {from}</p>

      <button
        type="submit"
        onClick={handleSubmit}
        className="rounded bg-indigo-50 px-2 py-1 text-xs font-semibold text-blue-600 shadow-sm hover:bg-blue-100"
      >
        SignIn
      </button>

      <a href="/" className="px-2 py-1 text-xs font-semibold text-blue-600">
        Back Home
      </a>
    </div>
  );
}

function redirectToSignIn() {
  openExternal(
    `${baseLinen}/signin?sso=1&callbackUrl=${encodeURI(callbackUrl())}`
  );
}

function handleSubmit(event: any) {
  event.preventDefault();
  redirectToSignIn();
}