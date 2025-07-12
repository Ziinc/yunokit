
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  AlertTriangle,
  Check,
  X,
  Search
} from "lucide-react";
import { Report, Comment } from "@/types/comments";

interface ReportsTabProps {
  reports: Report[];
  comments: Comment[];
  reportsSearchQuery: string;
  selectedReport: Report | null;
  setReportsSearchQuery: (query: string) => void;
  setSelectedReport: (report: Report | null) => void;
  handleResolveReport: (reportId: string) => void;
  handleDismissReport: (reportId: string) => void;
  formatDate: (dateString: string) => string;
}

const ReportsTab: React.FC<ReportsTabProps> = ({
  reports,
  comments,
  reportsSearchQuery,
  selectedReport,
  setReportsSearchQuery,
  setSelectedReport,
  handleResolveReport,
  handleDismissReport,
  formatDate
}) => {
  // Filter reports based on search query
  const filteredReports = reports.filter(report => 
    report.targetName.toLowerCase().includes(reportsSearchQuery.toLowerCase()) ||
    report.reason.toLowerCase().includes(reportsSearchQuery.toLowerCase()) ||
    (report.contentTitle && report.contentTitle.toLowerCase().includes(reportsSearchQuery.toLowerCase()))
  );

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Content Reports</CardTitle>
            <CardDescription>Review and manage reported content and users</CardDescription>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
            <Input 
              placeholder="Search reports..." 
              value={reportsSearchQuery}
              onChange={(e) => setReportsSearchQuery(e.target.value)}
              className="pl-9 w-[240px]"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Type</TableHead>
              <TableHead>Reported</TableHead>
              <TableHead>Reason</TableHead>
              <TableHead>Reporter</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredReports.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                  No reports found matching the current filters
                </TableCell>
              </TableRow>
            ) : (
              filteredReports.map((report) => (
                <TableRow key={report.id}>
                  <TableCell>
                    <Badge 
                      variant={report.type === "comment" ? "outline" : "secondary"}
                      className="capitalize"
                    >
                      {report.type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="max-w-[180px]">
                      <div className="font-medium">{report.targetName}</div>
                      {report.contentTitle && (
                        <div className="text-xs text-muted-foreground truncate">
                          on: {report.contentTitle}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="max-w-[200px] truncate">
                      {report.reason}
                    </div>
                  </TableCell>
                  <TableCell>
                    {report.reporter.name}
                  </TableCell>
                  <TableCell>
                    {formatDate(report.createdAt)}
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={
                        report.status === "pending" ? "destructive" : 
                        report.status === "resolved" ? "default" : 
                        "secondary"
                      }
                      className="capitalize"
                    >
                      {report.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            size="sm"
                            variant="outline"
                            className="h-8 gap-1"
                            onClick={() => setSelectedReport(report)}
                          >
                            <AlertTriangle size={16} />
                            <span>View</span>
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[550px]">
                          <DialogHeader>
                            <DialogTitle>Report Details</DialogTitle>
                            <DialogDescription>
                              Review the reported content and take action
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4 my-3">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label className="text-muted-foreground">Report Type</Label>
                                <div className="font-medium mt-1 capitalize">{selectedReport?.type}</div>
                              </div>
                              <div>
                                <Label className="text-muted-foreground">Status</Label>
                                <div className="font-medium mt-1 capitalize">{selectedReport?.status}</div>
                              </div>
                              <div>
                                <Label className="text-muted-foreground">Reported Item</Label>
                                <div className="font-medium mt-1">{selectedReport?.targetName}</div>
                              </div>
                              <div>
                                <Label className="text-muted-foreground">Reporter</Label>
                                <div className="font-medium mt-1">{selectedReport?.reporter.name}</div>
                              </div>
                              {selectedReport?.contentTitle && (
                                <div className="col-span-2">
                                  <Label className="text-muted-foreground">Content</Label>
                                  <div className="font-medium mt-1">{selectedReport?.contentTitle}</div>
                                </div>
                              )}
                              <div className="col-span-2">
                                <Label className="text-muted-foreground">Reason for Report</Label>
                                <div className="font-medium mt-1 p-3 border rounded-md bg-muted/50">
                                  {selectedReport?.reason}
                                </div>
                              </div>
                            </div>
                            
                            {selectedReport?.type === "comment" && (
                              <div>
                                <Label className="text-muted-foreground">Comment Content</Label>
                                <div className="font-medium mt-1 p-3 border rounded-md bg-muted/50">
                                  {comments.find(c => c.id === selectedReport?.targetId)?.content || "Content not available"}
                                </div>
                              </div>
                            )}
                          </div>
                          <DialogFooter className="gap-2">
                            {selectedReport?.status === "pending" && (
                              <>
                                <Button 
                                  variant="default" 
                                  onClick={() => {
                                    if (selectedReport) {
                                      handleResolveReport(selectedReport.id);
                                      setSelectedReport(null);
                                    }
                                  }}
                                >
                                  Resolve Report
                                </Button>
                                <Button 
                                  variant="outline" 
                                  onClick={() => {
                                    if (selectedReport) {
                                      handleDismissReport(selectedReport.id);
                                      setSelectedReport(null);
                                    }
                                  }}
                                >
                                  Dismiss
                                </Button>
                              </>
                            )}
                            {selectedReport?.status !== "pending" && (
                              <Button onClick={() => setSelectedReport(null)}>Close</Button>
                            )}
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                      
                      {report.status === "pending" && (
                        <>
                          <Button 
                            onClick={() => handleResolveReport(report.id)}
                            size="sm"
                            variant="outline"
                            className="h-8 w-8 p-0"
                          >
                            <Check size={16} className="text-green-500" />
                          </Button>
                          <Button 
                            onClick={() => handleDismissReport(report.id)}
                            size="sm"
                            variant="outline"
                            className="h-8 w-8 p-0"
                          >
                            <X size={16} />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default ReportsTab;
