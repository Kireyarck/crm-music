// Implemented a generic placeholder page for future sections.
import React from 'react';
import Card from '../components/Card';

interface PlaceholderPageProps {
  title: string;
}

const PlaceholderPage: React.FC<PlaceholderPageProps> = ({ title }) => {
  return (
    <div className="flex items-center justify-center h-full">
      <Card className="text-center">
        <h2 className="text-3xl font-bold mb-2">{title}</h2>
        <p className="text-gray-400">Esta seção está em construção.</p>
        <p className="text-gray-500 text-sm mt-4">Volte em breve para conferir as novidades!</p>
      </Card>
    </div>
  );
};

export default PlaceholderPage;
