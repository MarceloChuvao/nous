import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";

interface StatCardProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    description?: string;
    trend?: {
        value: number;
        label: string;
    };
    className?: string;
    index?: number;
}

export function StatCard({
    title,
    value,
    icon: Icon,
    description,
    trend,
    className,
    index = 0,
}: StatCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
        >
            <Card className={cn(
                "relative overflow-hidden border-white/10 bg-white/5 backdrop-blur-xl transition-colors hover:bg-white/10 dark:bg-black/20 dark:hover:bg-black/30",
                className
            )}>
                {/* Decorative gradient blob */}
                <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-primary-500/10 blur-3xl transition-all group-hover:bg-primary-500/20" />

                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                        {title}
                    </CardTitle>
                    <div className="rounded-full bg-primary-500/10 p-2">
                        <Icon className="h-4 w-4 text-primary-500" />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold tracking-tight">{value}</div>
                    {(description || trend) && (
                        <div className="text-xs text-muted-foreground mt-2 flex items-center gap-2">
                            {trend && (
                                <span
                                    className={cn(
                                        "flex items-center font-medium px-1.5 py-0.5 rounded-full bg-opacity-10",
                                        trend.value > 0
                                            ? "text-emerald-500 bg-emerald-500/10"
                                            : "text-rose-500 bg-rose-500/10"
                                    )}
                                >
                                    {trend.value > 0 ? "+" : ""}
                                    {trend.value}%
                                </span>
                            )}
                            {description && <span>{description}</span>}
                        </div>
                    )}
                </CardContent>
            </Card>
        </motion.div>
    );
}
