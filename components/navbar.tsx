"use client"

import { Disclosure, DisclosureButton, DisclosurePanel, Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'
import { Bars3Icon, ArrowRightOnRectangleIcon, XMarkIcon, Cog6ToothIcon } from '@heroicons/react/24/outline'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { logout } from '@/app/actions/auth'

function classNames(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ')
}

interface NavbarProps {
  onExportCSV?: () => void
}

export function Navbar({ onExportCSV }: NavbarProps) {
  const pathname = usePathname()

  const navigation = [
    { name: 'Pacientes', href: '/', current: pathname === '/' },
    { name: 'Diagnóstico do Sistema', href: '/diagnostics', current: pathname === '/diagnostics' },
  ]

  const handleLogout = async () => {
    await logout()
  }

  return (
    <Disclosure as="nav" className="border-b border-gray-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between">
          <div className="flex">
            <div className="flex shrink-0 items-center">
              <Link href="/" className="flex items-center gap-3">
                <Image
                  alt="Baby Bubbles"
                  src="/logo.png"
                  width={40}
                  height={40}
                  className="h-10 w-auto"
                />
                <span className="hidden sm:block text-lg font-semibold text-secondary">
                  Baby Bubbles - Prontuário Eletrônico
                </span>
              </Link>
            </div>
            <div className="hidden sm:-my-px sm:ml-8 sm:flex sm:space-x-8">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  aria-current={item.current ? 'page' : undefined}
                  className={classNames(
                    item.current
                      ? 'border-primary text-gray-900'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700',
                    'inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium',
                  )}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center gap-2">
            {onExportCSV && (
              <button
                type="button"
                onClick={onExportCSV}
                className="inline-flex items-center gap-1.5 rounded-md bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 border border-gray-300"
              >
                Exportar CSV
              </button>
            )}

            {/* Settings/Logout dropdown */}
            <Menu as="div" className="relative">
              <MenuButton className="relative flex items-center rounded-md bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 border border-gray-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
                <Cog6ToothIcon className="h-5 w-5 mr-1.5" />
                <span className="hidden lg:inline">Configurações</span>
              </MenuButton>

              <MenuItems
                transition
                className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black/5 transition data-closed:scale-95 data-closed:transform data-closed:opacity-0 data-enter:duration-200 data-enter:ease-out data-leave:duration-75 data-leave:ease-in"
              >
                <MenuItem>
                  <Link
                    href="/diagnostics"
                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 data-focus:bg-gray-100"
                  >
                    <Cog6ToothIcon className="h-4 w-4" />
                    Diagnóstico do Sistema
                  </Link>
                </MenuItem>
                <MenuItem>
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-700 data-focus:bg-gray-100"
                  >
                    <ArrowRightOnRectangleIcon className="h-4 w-4" />
                    Sair
                  </button>
                </MenuItem>
              </MenuItems>
            </Menu>
          </div>
          <div className="-mr-2 flex items-center sm:hidden">
            {/* Mobile menu button */}
            <DisclosureButton className="group relative inline-flex items-center justify-center rounded-md bg-white p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-2 focus:outline-offset-2 focus:outline-primary">
              <span className="absolute -inset-0.5" />
              <span className="sr-only">Abrir menu</span>
              <Bars3Icon aria-hidden="true" className="block size-6 group-data-open:hidden" />
              <XMarkIcon aria-hidden="true" className="hidden size-6 group-data-open:block" />
            </DisclosureButton>
          </div>
        </div>
      </div>

      <DisclosurePanel className="sm:hidden">
        <div className="space-y-1 pt-2 pb-3">
          {navigation.map((item) => (
            <DisclosureButton
              key={item.name}
              as={Link}
              href={item.href}
              aria-current={item.current ? 'page' : undefined}
              className={classNames(
                item.current
                  ? 'border-primary bg-primary/10 text-secondary'
                  : 'border-transparent text-gray-600 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-800',
                'block border-l-4 py-2 pr-4 pl-3 text-base font-medium',
              )}
            >
              {item.name}
            </DisclosureButton>
          ))}
        </div>
        <div className="border-t border-gray-200 pt-4 pb-3">
          <div className="flex items-center px-4">
            <div className="shrink-0">
              <Image
                alt="Baby Bubbles"
                src="/logo.png"
                width={40}
                height={40}
                className="h-10 w-10 rounded-full"
              />
            </div>
            <div className="ml-3">
              <div className="text-base font-medium text-gray-800">Baby Bubbles</div>
              <div className="text-sm font-medium text-gray-500">Prontuário Eletrônico</div>
            </div>
          </div>
          <div className="mt-3 space-y-1">
            {onExportCSV && (
              <DisclosureButton
                as="button"
                onClick={onExportCSV}
                className="block w-full text-left px-4 py-2 text-base font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-800"
              >
                Exportar CSV
              </DisclosureButton>
            )}
            <DisclosureButton
              as={Link}
              href="/diagnostics"
              className="block px-4 py-2 text-base font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-800"
            >
              Diagnóstico do Sistema
            </DisclosureButton>
            <DisclosureButton
              as="button"
              onClick={handleLogout}
              className="block w-full text-left px-4 py-2 text-base font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-800"
            >
              Sair
            </DisclosureButton>
          </div>
        </div>
      </DisclosurePanel>
    </Disclosure>
  )
}
