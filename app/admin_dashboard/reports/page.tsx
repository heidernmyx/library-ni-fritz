'use client'

import React from 'react'
import LogTable from '@/components/admin/activityLogs'
import Reports from '@/components/admin/reports'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Activity, BarChart3, BookAIcon } from 'lucide-react'
import AdminAttentionList from '@/components/librarian/getAdminAttention'

const ReportsPage = () => {
  return (
      <Card className='bg-transparent border-none w-[80%] h-[90%]'>
      
        <CardContent className='w-full'>
          <Tabs defaultValue="logs" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="logs" className="space-x-2">
                <Activity className="h-4 w-4" />
                <span>Activity Logs</span>
              </TabsTrigger>
              <TabsTrigger value="analytics" className="space-x-2">
                <BarChart3 className="h-4 w-4" />
                <span>Analytics</span>
            </TabsTrigger>
            <TabsTrigger value="reports" className="space-x-2">
                <BookAIcon className="h-4 w-4" />
                <span>Reports</span>
              </TabsTrigger>
            </TabsList>
            <TabsContent value="logs">
              <LogTable />
            </TabsContent>
            <TabsContent value="analytics" >
              <Reports />
          </TabsContent>
          <TabsContent value="reports">
            <AdminAttentionList/>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
  )
}

export default ReportsPage