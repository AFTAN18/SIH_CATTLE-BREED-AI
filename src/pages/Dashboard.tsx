import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Camera, 
  BarChart3, 
  Award, 
  Wifi, 
  WifiOff, 
  Calendar,
  TrendingUp,
  BookOpen,
  Plus,
  History,
  Target,
  Users,
  Activity,
  Sparkles,
  Trophy,
  Star
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const Dashboard = () => {
  const navigate = useNavigate();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [stats] = useState({
    todayCount: 12,
    weekCount: 67,
    monthCount: 234,
    accuracyScore: 94,
    streak: 8,
    totalAnimals: 1247,
    weeklyGoal: 300
  });

  // Chart data
  const weeklyData = [
    { day: 'Mon', registrations: 8, accuracy: 92 },
    { day: 'Tue', registrations: 12, accuracy: 95 },
    { day: 'Wed', registrations: 15, accuracy: 88 },
    { day: 'Thu', registrations: 10, accuracy: 96 },
    { day: 'Fri', registrations: 18, accuracy: 94 },
    { day: 'Sat', registrations: 14, accuracy: 91 },
    { day: 'Sun', registrations: 12, accuracy: 94 }
  ];

  const breedDistribution = [
    { name: 'Holstein', value: 35, color: '#22c55e' },
    { name: 'Gir', value: 25, color: '#f59e0b' },
    { name: 'Jersey', value: 20, color: '#3b82f6' },
    { name: 'Murrah', value: 15, color: '#8b5cf6' },
    { name: 'Others', value: 5, color: '#6b7280' }
  ];

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const recentRegistrations = [
    { id: 1, breed: 'Holstein Friesian', confidence: 96, time: '2 hours ago', verified: true, image: '🐄' },
    { id: 2, breed: 'Gir', confidence: 89, time: '4 hours ago', verified: false, image: '🐄' },
    { id: 3, breed: 'Murrah Buffalo', confidence: 94, time: '6 hours ago', verified: true, image: '🐃' },
    { id: 4, breed: 'Jersey', confidence: 91, time: '8 hours ago', verified: true, image: '🐄' },
  ];

  const achievements = [
    { id: 1, title: 'First Capture', description: 'Captured your first animal', icon: '🎯', unlocked: true },
    { id: 2, title: 'Accuracy Master', description: 'Achieved 95%+ accuracy', icon: '🏆', unlocked: true },
    { id: 3, title: 'Weekly Goal', description: 'Met weekly target', icon: '⭐', unlocked: true },
    { id: 4, title: 'Expert Level', description: '1000+ registrations', icon: '👑', unlocked: false },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5 }
    }
  };

  const cardVariants = {
    hidden: { scale: 0.9, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: { duration: 0.6 }
    }
  };

  return (
    <motion.div 
      className="min-h-screen bg-gradient-earth"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.header 
        className="bg-gradient-primary text-primary-foreground p-6 shadow-medium"
        variants={itemVariants}
      >
        <div className="flex items-center justify-between">
          <div>
            <motion.h1 
              className="text-3xl font-bold"
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              Welcome Back!
            </motion.h1>
            <motion.p 
              className="text-primary-foreground/80 text-lg"
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              Ready to identify more breeds?
            </motion.p>
          </div>
          <motion.div 
            className="flex items-center gap-2"
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            {isOnline ? (
              <Badge variant="secondary" className="bg-success text-success-foreground animate-bounce-gentle">
                <Wifi className="w-4 h-4 mr-1" />
                Online
              </Badge>
            ) : (
              <Badge variant="destructive">
                <WifiOff className="w-4 h-4 mr-1" />
                Offline
              </Badge>
            )}
          </motion.div>
        </div>
      </motion.header>

      {/* Quick Action */}
      <motion.div 
        className="p-6"
        variants={itemVariants}
      >
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Button
            onClick={() => navigate('/camera')}
            className="w-full h-20 text-xl font-semibold bg-gradient-primary hover:bg-primary-hover shadow-glow touch-target"
            size="lg"
          >
            <Camera className="w-8 h-8 mr-3" />
            Identify New Breed
          </Button>
        </motion.div>
      </motion.div>

      {/* Stats Grid */}
      <div className="px-6 space-y-6">
        <motion.h2 
          className="text-2xl font-semibold text-foreground flex items-center gap-2"
          variants={itemVariants}
        >
          <BarChart3 className="w-6 h-6 text-primary" />
          Your Statistics
        </motion.h2>
        
        <div className="grid grid-cols-2 gap-4">
          {[
            { icon: Calendar, value: stats.todayCount, label: 'Today', color: 'text-primary' },
            { icon: TrendingUp, value: stats.weekCount, label: 'This Week', color: 'text-accent' },
            { icon: Award, value: `${stats.accuracyScore}%`, label: 'Accuracy', color: 'text-success' },
            { icon: Target, value: stats.streak, label: 'Day Streak', color: 'text-warning' }
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              variants={cardVariants}
              whileHover={{ y: -5, scale: 1.02 }}
              className="card-hover"
            >
              <Card className="shadow-soft border-0">
                <CardContent className="p-4 text-center">
                  <stat.icon className={`w-8 h-8 ${stat.color} mx-auto mb-2`} />
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Progress Section */}
        <motion.div variants={cardVariants}>
          <Card className="shadow-soft border-0">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Trophy className="w-5 h-5 text-primary" />
                Monthly Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span>Registrations: {stats.monthCount}/{stats.weeklyGoal}</span>
                  <span>{Math.round((stats.monthCount / stats.weeklyGoal) * 100)}%</span>
                </div>
                <Progress 
                  value={(stats.monthCount / stats.weeklyGoal) * 100} 
                  className="h-3 bg-muted"
                />
                <p className="text-xs text-muted-foreground">
                  Great progress! You're {stats.weeklyGoal - stats.monthCount} registrations away from your monthly goal.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Charts Section */}
        <motion.div variants={cardVariants}>
          <Card className="shadow-soft border-0">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                Weekly Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={weeklyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="day" stroke="#6b7280" />
                    <YAxis stroke="#6b7280" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="registrations" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={3}
                      dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Activity */}
        <motion.div variants={cardVariants}>
          <Card className="shadow-soft border-0">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <History className="w-5 h-5 text-primary" />
                Recent Registrations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentRegistrations.map((item, index) => (
                <motion.div 
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted/70 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{item.image}</span>
                    <div className="flex-1">
                      <p className="font-medium text-foreground">{item.breed}</p>
                      <p className="text-sm text-muted-foreground">{item.time}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={item.confidence >= 90 ? "default" : "secondary"}>
                      {item.confidence}%
                    </Badge>
                    {item.verified && (
                      <Badge variant="outline" className="text-success border-success">
                        <Star className="w-3 h-3 mr-1" />
                        Verified
                      </Badge>
                    )}
                  </div>
                </motion.div>
              ))}
              
              <Button variant="outline" className="w-full">
                View All History
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Achievements */}
        <motion.div variants={cardVariants}>
          <Card className="shadow-soft border-0">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                Achievements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {achievements.map((achievement) => (
                  <motion.div
                    key={achievement.id}
                    whileHover={{ scale: 1.05 }}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      achievement.unlocked 
                        ? 'border-success bg-success/10' 
                        : 'border-muted bg-muted/30 opacity-50'
                    }`}
                  >
                    <div className="text-center">
                      <span className="text-2xl">{achievement.icon}</span>
                      <p className="font-medium text-sm mt-1">{achievement.title}</p>
                      <p className="text-xs text-muted-foreground">{achievement.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Learning Resources */}
        <motion.div variants={cardVariants}>
          <Card className="shadow-soft border-0">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-primary" />
                Learning Resources
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button variant="ghost" className="w-full justify-start h-auto p-3">
                  <Plus className="w-4 h-4 mr-3" />
                  <div className="text-left">
                    <p className="font-medium">Breed Identification Tips</p>
                    <p className="text-sm text-muted-foreground">Learn key features to identify breeds</p>
                  </div>
                </Button>
                <Button variant="ghost" className="w-full justify-start h-auto p-3">
                  <Plus className="w-4 h-4 mr-3" />
                  <div className="text-left">
                    <p className="font-medium">Photography Guidelines</p>
                    <p className="text-sm text-muted-foreground">Best practices for capturing images</p>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Bottom padding for safe area */}
      <div className="h-20"></div>
    </motion.div>
  );
};

export default Dashboard;