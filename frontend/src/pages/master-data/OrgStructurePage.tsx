import React, { useEffect, useState } from 'react';
import { api } from '../../api/client';
import { Card } from '../../components/common/Card';
import { Plant } from '../../types';
import { Network, Factory, Building, ShoppingBag, MapPin } from 'lucide-react';

export const OrgStructurePage: React.FC = () => {
  const [plants, setPlants] = useState<Plant[]>([]);
  const [orgData, setOrgData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get('/plants'), api.get('/orgs')])
      .then(([plantsRes, orgsRes]) => {
        if (plantsRes.data.success) setPlants(plantsRes.data.data);
        if (orgsRes.data.success) setOrgData(orgsRes.data.data);
      })
      .catch((err) => console.error('Error fetching org data:', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-xs text-slate-500">
        Loading Enterprise Organizational Hierarchy...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
          <Network className="w-5 h-5 text-sap-blue" />
          <span>Enterprise Organizational Structure</span>
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          SAP-inspired enterprise architecture mapping Plants, Storage Locations, Purchasing Organizations, and Sales Areas.
        </p>
      </div>

      {/* Plants & Storage Locations */}
      <Card
        title="Manufacturing Plants & Storage Locations (SAP Plant Master)"
        subtitle="Physical manufacturing facilities and designated warehouse storage bays"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {plants.map((plant) => (
            <div
              key={plant.id}
              className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <Factory className="w-4 h-4 text-sap-blue" />
                    <span className="font-mono font-bold text-sm text-slate-900 dark:text-white">{plant.code}</span>
                  </div>
                  <h4 className="font-semibold text-xs text-slate-800 dark:text-slate-200 mt-1">{plant.name}</h4>
                </div>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-slate-400" />
                  {plant.city}, {plant.country}
                </span>
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                  Storage Locations ({plant.storageLocations?.length || 0})
                </span>
                <div className="space-y-1">
                  {plant.storageLocations?.map((loc) => (
                    <div
                      key={loc.id}
                      className="px-2 py-1 rounded bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between text-xs"
                    >
                      <span className="font-mono font-bold text-sap-blue text-[11px]">{loc.code}</span>
                      <span className="text-slate-600 dark:text-slate-300 text-[11px] truncate max-w-[170px]">{loc.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Purchasing & Sales Organizations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card
          title="Purchasing Organizations (SAP MM)"
          subtitle="Legal entities responsible for commercial procurement and supplier contracts"
        >
          <div className="space-y-3">
            {orgData?.purchasingOrgs?.map((po: any) => (
              <div
                key={po.id}
                className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <Building className="w-4 h-4 text-sap-blue" />
                  <div>
                    <span className="font-mono font-bold text-slate-900 dark:text-white mr-2">{po.code}</span>
                    <span className="text-slate-600 dark:text-slate-300">{po.name}</span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950 text-emerald-600 text-[10px] font-mono">
                  ACTIVE
                </span>
              </div>
            ))}
          </div>
        </Card>

        <Card
          title="Sales Organizations & Distribution Channels (SAP SD)"
          subtitle="Commercial units executing domestic distribution and international exports"
        >
          <div className="space-y-3">
            {orgData?.salesOrgs?.map((so: any) => (
              <div
                key={so.id}
                className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <ShoppingBag className="w-4 h-4 text-emerald-600" />
                  <div>
                    <span className="font-mono font-bold text-slate-900 dark:text-white mr-2">{so.code}</span>
                    <span className="text-slate-600 dark:text-slate-300">{so.name}</span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950 text-emerald-600 text-[10px] font-mono">
                  ACTIVE
                </span>
              </div>
            ))}

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                Distribution Channels
              </span>
              <div className="flex flex-wrap gap-2">
                {orgData?.distributionChannels?.map((dc: any) => (
                  <span
                    key={dc.id}
                    className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-mono text-slate-700 dark:text-slate-300"
                  >
                    <span className="font-bold text-emerald-600 mr-1.5">{dc.code}</span>
                    {dc.name}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
