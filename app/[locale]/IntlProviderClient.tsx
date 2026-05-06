'use client'

import { NextIntlClientProvider } from 'next-intl'
import { ReactNode } from 'react'

export default function IntlProviderClient({ children, locale, messages }: { children: ReactNode, locale: string, messages: any }) {
    return (
        <NextIntlClientProvider locale={locale} messages={messages} timeZone="Europe/Madrid">
            {children}
        </NextIntlClientProvider>
    )
}