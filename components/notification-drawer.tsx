"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Bell, Check, X, Loader2, Building2, Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
    SheetBody,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { acceptOrgInvitation, declineOrgInvitation } from "@/lib/actions/organization";
import { SidebarMenuButton } from "@/components/ui/sidebar";

interface Invitation {
    id: string;
    organization: {
        id: string;
        name: string;
        slug: string;
        logoUrl: string | null;
    };
    role: string;
}

interface NotificationDrawerProps {
    readonly initialInvitations: Invitation[];
}

export function NotificationDrawer({ initialInvitations }: NotificationDrawerProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [invitations, setInvitations] = useState(initialInvitations);
    const [processingId, setProcessingId] = useState<string | null>(null);
    const [open, setOpen] = useState(false);

    async function handleAccept(id: string) {
        setProcessingId(id);
        startTransition(async () => {
            const result = await acceptOrgInvitation(id);
            if (result.success) {
                toast.success("Invitation accepted! Welcome aboard.");
                setInvitations((prev) => prev.filter((inv) => inv.id !== id));
                setOpen(false);
                router.refresh();
            } else {
                toast.error(result.error ?? "Failed to accept invitation");
                setProcessingId(null);
            }
        });
    }

    async function handleDecline(id: string) {
        setProcessingId(id);
        startTransition(async () => {
            const result = await declineOrgInvitation(id);
            if (result.success) {
                toast.success("Invitation declined.");
                setInvitations((prev) => prev.filter((inv) => inv.id !== id));
                setProcessingId(null);
                router.refresh();
            } else {
                toast.error(result.error ?? "Failed to decline invitation");
                setProcessingId(null);
            }
        });
    }

    const pendingCount = invitations.length;

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <SidebarMenuButton
                    size="sm"
                    className="relative"
                    tooltip="Notifications"
                >
                    <Bell className="size-4" />
                    {pendingCount > 0 && (
                        <Badge
                            variant="destructive"
                            className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-[10px] font-bold"
                        >
                            {pendingCount > 9 ? "9+" : pendingCount}
                        </Badge>
                    )}
                    <span className="sr-only">Notifications</span>
                </SidebarMenuButton>
            </SheetTrigger>
            <SheetContent side="right" className="w-full sm:max-w-md">
                <SheetHeader>
                    <SheetTitle className="flex items-center gap-2">
                        <Bell className="h-5 w-5" />
                        Notifications
                    </SheetTitle>
                    <SheetDescription>
                        Organization invitations and updates
                    </SheetDescription>
                </SheetHeader>
                <SheetBody className="mt-6">
                    {invitations.length > 0 ? (
                        <div className="space-y-4">
                            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                                Pending Invitations
                            </h3>
                            {invitations.map((invitation) => (
                                <Card key={invitation.id} className="overflow-hidden">
                                    <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-2">
                                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                            {invitation.organization.logoUrl ? (
                                                <img
                                                    src={invitation.organization.logoUrl}
                                                    alt={invitation.organization.name}
                                                    className="h-full w-full object-cover rounded-lg"
                                                />
                                            ) : (
                                                <Building2 className="h-6 w-6" />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <CardTitle className="text-base truncate">
                                                {invitation.organization.name}
                                            </CardTitle>
                                            <p className="text-sm text-muted-foreground">
                                                Role: <span className="capitalize">{invitation.role}</span>
                                            </p>
                                        </div>
                                    </CardHeader>
                                    <CardFooter className="bg-muted/30 pt-4 flex gap-2">
                                        <Button
                                            size="sm"
                                            className="flex-1"
                                            onClick={() => handleAccept(invitation.id)}
                                            disabled={isPending && processingId === invitation.id}
                                        >
                                            {isPending && processingId === invitation.id ? (
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            ) : (
                                                <Check className="mr-2 h-4 w-4" />
                                            )}
                                            Accept
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="flex-1"
                                            onClick={() => handleDecline(invitation.id)}
                                            disabled={isPending && processingId === invitation.id}
                                        >
                                            <X className="mr-2 h-4 w-4" />
                                            Decline
                                        </Button>
                                    </CardFooter>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
                                <Inbox className="h-8 w-8 text-muted-foreground" />
                            </div>
                            <h3 className="text-lg font-semibold">All caught up!</h3>
                            <p className="text-sm text-muted-foreground mt-1 max-w-[200px]">
                                You have no pending notifications or invitations.
                            </p>
                        </div>
                    )}
                </SheetBody>
            </SheetContent>
        </Sheet>
    );
}
