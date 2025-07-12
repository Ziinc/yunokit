
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Trash } from "lucide-react";
import { BannedWord } from "@/types/comments";

interface ModerationTabProps {
  bannedWords: BannedWord[];
  bannedWordText: string;
  bannedWordAction: "flag" | "delete" | "ban";
  setBannedWordText: (text: string) => void;
  setBannedWordAction: (action: "flag" | "delete" | "ban") => void;
  handleAddBannedWord: () => void;
  handleDeleteBannedWord: (wordId: string) => void;
  formatDate: (dateString: string) => string;
}

const ModerationTab: React.FC<ModerationTabProps> = ({
  bannedWords,
  bannedWordText,
  bannedWordAction,
  setBannedWordText,
  setBannedWordAction,
  handleAddBannedWord,
  handleDeleteBannedWord,
  formatDate
}) => {
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Automated Moderation Rules</CardTitle>
          <CardDescription>
            Configure rules to automatically moderate comments and user content
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-end gap-3">
              <div className="space-y-2 flex-1">
                <Label htmlFor="banned-word">Add Banned Word</Label>
                <Input 
                  id="banned-word" 
                  placeholder="Enter a word to ban" 
                  value={bannedWordText}
                  onChange={(e) => setBannedWordText(e.target.value)}
                />
              </div>
              <div className="space-y-2 w-[200px]">
                <Label htmlFor="banned-action">Action</Label>
                <Select value={bannedWordAction} onValueChange={(value: "flag" | "delete" | "ban") => setBannedWordAction(value)}>
                  <SelectTrigger id="banned-action">
                    <SelectValue placeholder="Select action" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="flag">Flag Comment</SelectItem>
                    <SelectItem value="delete">Delete Comment</SelectItem>
                    <SelectItem value="ban">Ban User</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleAddBannedWord} disabled={!bannedWordText.trim()}>
                Add Word
              </Button>
            </div>
            
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Word</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead>Added On</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bannedWords.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                      No banned words configured yet
                    </TableCell>
                  </TableRow>
                ) : (
                  bannedWords.map((word) => (
                    <TableRow key={word.id}>
                      <TableCell>
                        <code className="px-2 py-1 bg-muted rounded">{word.word}</code>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={
                            word.action === "ban" ? "destructive" : 
                            word.action === "delete" ? "default" : 
                            "secondary"
                          }
                          className="capitalize"
                        >
                          {word.action}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline" 
                          className={`capitalize ${
                            word.severity === "high" ? "text-destructive" : 
                            word.severity === "medium" ? "text-amber-500" : 
                            "text-muted-foreground"
                          }`}
                        >
                          {word.severity}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {formatDate(word.createdAt)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button 
                          onClick={() => handleDeleteBannedWord(word.id)}
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 hover:text-destructive"
                        >
                          <Trash size={16} />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Auto-Moderation Settings</CardTitle>
          <CardDescription>
            Configure system settings for automated content moderation
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between space-x-2">
              <div className="space-y-0.5">
                <Label htmlFor="approval-required">Pre-Approval Required</Label>
                <p className="text-sm text-muted-foreground">
                  Require all comments to be approved before they are published
                </p>
              </div>
              <Switch id="approval-required" defaultChecked />
            </div>
            
            <div className="flex items-center justify-between space-x-2">
              <div className="space-y-0.5">
                <Label htmlFor="auto-spam">Automatic Spam Detection</Label>
                <p className="text-sm text-muted-foreground">
                  Use AI to automatically detect and flag potential spam comments
                </p>
              </div>
              <Switch id="auto-spam" defaultChecked />
            </div>
            
            <div className="flex items-center justify-between space-x-2">
              <div className="space-y-0.5">
                <Label htmlFor="ban-ip">Ban IP Addresses</Label>
                <p className="text-sm text-muted-foreground">
                  When banning a user, also ban their IP address
                </p>
              </div>
              <Switch id="ban-ip" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="report-threshold">Automatic Action Threshold</Label>
              <p className="text-sm text-muted-foreground">
                Number of reports required before automatic action is taken
              </p>
              <Select defaultValue="3">
                <SelectTrigger id="report-threshold" className="w-[180px]">
                  <SelectValue placeholder="Select threshold" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 report</SelectItem>
                  <SelectItem value="2">2 reports</SelectItem>
                  <SelectItem value="3">3 reports</SelectItem>
                  <SelectItem value="5">5 reports</SelectItem>
                  <SelectItem value="10">10 reports</SelectItem>
                  <SelectItem value="0">Disabled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
};

export default ModerationTab;
