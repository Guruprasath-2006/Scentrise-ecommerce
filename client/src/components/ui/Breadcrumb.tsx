import { Link } from 'react-router-dom'

interface BreadcrumbProps {
  gender?: string
  family?: string
  searchQuery?: string
}

const Breadcrumb = ({ gender, family, searchQuery }: BreadcrumbProps) => {
  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Products', href: '/catalog' },
  ]

  if (gender) {
    breadcrumbItems.push({ 
      label: gender.charAt(0).toUpperCase() + gender.slice(1), 
      href: `/catalog?gender=${gender}` 
    })
  }

  if (family) {
    breadcrumbItems.push({ 
      label: family.charAt(0).toUpperCase() + family.slice(1), 
      href: `/catalog?${gender ? `gender=${gender}&` : ''}family=${family}` 
    })
  }

  if (searchQuery) {
    breadcrumbItems.push({ 
      label: `"${searchQuery}"`, 
      href: '' 
    })
  }

  return (
    <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
      {breadcrumbItems.map((item, index) => (
        <div key={index} className="flex items-center">
          {index > 0 && (
            <svg className="w-4 h-4 mx-2 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          )}
          {index === breadcrumbItems.length - 1 || !item.href ? (
            <span className="font-medium text-gray-900">{item.label}</span>
          ) : (
            <Link to={item.href} className="hover:text-primary-600 transition-colors">
              {item.label}
            </Link>
          )}
        </div>
      ))}
    </nav>
  )
}

export default Breadcrumb
