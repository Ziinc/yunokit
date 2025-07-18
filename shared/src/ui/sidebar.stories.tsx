import type { Meta, StoryObj } from '@storybook/react';
import { SidebarProvider, Sidebar, SidebarTrigger, SidebarMenu, SidebarMenuItem, SidebarInset } from './sidebar';
import { Button } from './button';

const meta: Meta<typeof SidebarProvider> = {
  title: 'UI/Sidebar',
  component: SidebarProvider,
};

export default meta;

type Story = StoryObj<typeof SidebarProvider>;

export const Basic: Story = {
  render: () => (
    <SidebarProvider>
      <Sidebar>
        <SidebarMenu>
          <SidebarMenuItem>Item 1</SidebarMenuItem>
          <SidebarMenuItem>Item 2</SidebarMenuItem>
        </SidebarMenu>
      </Sidebar>
      <SidebarInset>
        <div className="p-4">
          <SidebarTrigger asChild>
            <Button>Toggle</Button>
          </SidebarTrigger>
          <p className="mt-4">Content area</p>
        </div>
      </SidebarInset>
    </SidebarProvider>
  ),
};
