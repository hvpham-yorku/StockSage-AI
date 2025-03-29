'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { api } from '@/lib/api';
import { ExternalLink } from 'lucide-react';

interface CompanyInfoCardProps {
  symbol: string;
}

interface CompanyInfo {
  symbol: string;
  name: string;
  description: string;
  sector: string;
  industry: string;
  employees: number;
  headquarters: string;
  founded: number | null;
  ceo: string;
  website: string;
}

// Utility function to safely fetch and process company info
async function fetchAndProcessCompanyInfo(symbol: string): Promise<CompanyInfo> {
  // Fetch raw data from API
  const apiData = await api.stocks.getCompanyInfo(symbol);
  
  // Process the response to ensure correct types
  return {
    ...apiData,
    // Ensure employees is a number
    employees: typeof apiData.employees === 'number' ? apiData.employees : 0,
    // Process founded field to ensure it's a number or null
    founded: processFoundedYear(apiData.founded)
  };
}

// Helper function to process the founded year
function processFoundedYear(value: any): number | null {
  // If value is undefined or null, return null
  if (value === undefined || value === null) return null;
  
  // If it's already a number, use it
  if (typeof value === 'number') return value;
  
  // If it's a string, try to parse it, but only if it's not "Unknown"
  if (typeof value === 'string' && value !== 'Unknown') {
    const parsedValue = parseInt(value, 10);
    if (!isNaN(parsedValue)) return parsedValue;
  }
  
  // Default case: return null
  return null;
}

export default function CompanyInfoCard({ symbol }: CompanyInfoCardProps) {
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getCompanyInfo = async () => {
      try {
        setIsLoading(true);
        const processedData = await fetchAndProcessCompanyInfo(symbol);
        setCompanyInfo(processedData);
        setError(null);
      } catch (err) {
        console.error(`Error fetching company info for ${symbol}:`, err);
        setError('Failed to load company information');
      } finally {
        setIsLoading(false);
      }
    };

    getCompanyInfo();
  }, [symbol]);

  if (isLoading) return (
    <Card className="w-full mt-6">
      <CardHeader>
        <CardTitle>Company Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Skeleton className="h-[100px] w-full" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Skeleton className="h-[24px] w-[120px]" />
              <Skeleton className="h-[20px] w-full" />
              <Skeleton className="h-[24px] w-[120px]" />
              <Skeleton className="h-[20px] w-full" />
              <Skeleton className="h-[24px] w-[120px]" />
              <Skeleton className="h-[20px] w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-[24px] w-[120px]" />
              <Skeleton className="h-[20px] w-full" />
              <Skeleton className="h-[24px] w-[120px]" />
              <Skeleton className="h-[20px] w-full" />
              <Skeleton className="h-[24px] w-[120px]" />
              <Skeleton className="h-[20px] w-full" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
  
  if (error) return (
    <Alert variant="destructive" className="mt-6">
      <AlertDescription>{error}</AlertDescription>
    </Alert>
  );
  
  if (!companyInfo) return null;

  return (
    <Card className="w-full mt-6">
      <CardHeader>
        <CardTitle>Company Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-lg font-medium">About {companyInfo.name}</h3>
              <Badge variant="secondary">{companyInfo.sector}</Badge>
            </div>
            <p className="text-muted-foreground mt-1">{companyInfo.description}</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div>
                <h4 className="font-medium">Sector</h4>
                <p className="text-muted-foreground">{companyInfo.sector}</p>
              </div>
              <div>
                <h4 className="font-medium">Industry</h4>
                <p className="text-muted-foreground">{companyInfo.industry}</p>
              </div>
              <div>
                <h4 className="font-medium">Founded</h4>
                <p className="text-muted-foreground">{companyInfo.founded || 'N/A'}</p>
              </div>
            </div>
            
            <div className="space-y-2">
              <div>
                <h4 className="font-medium">CEO</h4>
                <p className="text-muted-foreground">{companyInfo.ceo}</p>
              </div>
              <div>
                <h4 className="font-medium">Employees</h4>
                <p className="text-muted-foreground">{companyInfo.employees.toLocaleString()}</p>
              </div>
              <div>
                <h4 className="font-medium">Headquarters</h4>
                <p className="text-muted-foreground">{companyInfo.headquarters}</p>
              </div>
            </div>
          </div>
          
          {companyInfo.website && (
            <div>
              <a 
                href={companyInfo.website} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center text-blue-600 hover:underline"
              >
                Visit Official Website
                <ExternalLink className="ml-1 h-4 w-4" />
              </a>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 