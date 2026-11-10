import Link from 'next/link'
import React from 'react'

type FooterLink = {
  label: string
  url: string
}

export const Footer: React.FC<{
  siteTitle: string
  footerText?: string | null
  icp?: string | null
  socialLinks?: FooterLink[] | null
}> = ({ siteTitle, footerText, icp, socialLinks }) => {
  const year = new Date().getFullYear()

  return (
    <footer className="mt-16 border-t border-white/20 dark:border-white/10">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-3 px-4 py-8 text-xs text-slate-500 dark:text-slate-400 sm:px-6 lg:px-8">
        {socialLinks && socialLinks.length > 0 ? (
          <ul className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
            {socialLinks.map((link) => (
              <li key={`${link.label}-${link.url}`}>
                <Link
                  className="transition-colors hover:text-indigo-500 dark:hover:text-sky-300"
                  href={link.url}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        ) : null}

        <p>
          © {year} {siteTitle}
          {footerText ? ` · ${footerText}` : ''}
        </p>

        {icp ? <p>{icp}</p> : null}
      </div>
    </footer>
  )
}
