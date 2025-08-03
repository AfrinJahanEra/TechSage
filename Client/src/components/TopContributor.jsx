// src/components/Sidebar.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import BlogCard from './BlogCard';
import ContributorCard from './ContributorCard';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import avatar from '../../src/assets/default-avatar.png';

const TopContributor = ({ type = 'default', currentBlogId = null }) => {
  const { primaryColor, darkMode } = useTheme();

  const topContributors = [
    {
      id: 1,
      image: avatar,
      name: 'Ramisa Anan Rahman',
      blogs: '15 research blogs'
    },
    {
      id: 2,
      image: avatar,
      name: 'Ridika Naznin',
      blogs: '12 research blogs'
    },
    {
      id: 3,
      image: avatar,
      name: 'Afrin Jahan Era',
      blogs: '9 research blogs'
    }
  ];

  return (
    <aside className="w-full md:max-w-xs space-y-8">
      <div className="space-y-4">
        <h3 className="uppercase text-sm font-semibold tracking-wider border-b pb-2" style={{ color: primaryColor, borderColor: darkMode ? '#374151' : '#e5e7eb' }}>
          Top Contributors
        </h3>
        <div className="space-y-4">
          {topContributors.map(contributor => (
            <ContributorCard key={contributor.id} {...contributor} />
          ))}
        </div>
        <div className="text-center">
          <Link 
            to="/top-contributors" 
            className="font-semibold hover:underline"
            style={{ color: primaryColor }}
          >
            See All Contributors →
          </Link>
        </div>
      </div>
    </aside>
  );
};

export default TopContributor;