import React, { useState } from 'react';
import { Card,  CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/tabs';
import { Trophy,Clock,Shield,Star,Award,User} from 'lucide-react';
import { REWARD_TYPES } from '../../components/Analytics/constants';

const RewardsSummaryCard = ({ title, count, icon }) => (
  <div className="bg-white p-4 rounded-lg shadow border">
    <div className="flex items-center gap-3">
      <div className="p-2 bg-blue-50 rounded-full">
        {icon}
      </div>
      <div>
        <h3 className="font-medium text-sm text-gray-600">{title}</h3>
        <p className="text-2xl font-bold">{count}</p>
      </div>
    </div>
  </div>
);

const LeaderboardTable = ({ rewards, onDriverSelect }) => {
  const driverStats = rewards.reduce((acc, reward) => {
    if (!acc[reward.driverId]) {
      acc[reward.driverId] = {
        name: reward.driverName,
        points: 0,
        rewards: 0
      };
    }
    acc[reward.driverId].points += reward.points;
    acc[reward.driverId].rewards += 1;
    return acc;
  }, {});

  const leaderboard = Object.entries(driverStats)
    .map(([id, stats]) => ({
      id,
      ...stats
    }))
    .sort((a, b) => b.points - a.points);

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b">
            <th className="text-left py-3 px-4">Rank</th>
            <th className="text-left py-3 px-4">Driver</th>
            <th className="text-right py-3 px-4">Points</th>
            <th className="text-right py-3 px-4">Rewards</th>
          </tr>
        </thead>
        <tbody>
          {leaderboard.map((driver, index) => (
            <tr 
              key={driver.id}
              className="border-b hover:bg-gray-50 cursor-pointer"
              onClick={() => onDriverSelect(driver.id)}
            >
              <td className="py-3 px-4">{index + 1}</td>
              <td className="py-3 px-4">{driver.name}</td>
              <td className="py-3 px-4 text-right">{driver.points}</td>
              <td className="py-3 px-4 text-right">{driver.rewards}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const AchievementsList = ({ rewards, selectedDriver }) => {
  const filteredRewards = selectedDriver
    ? rewards.filter(r => r.driverId === selectedDriver)
    : rewards;

  return (
    <div className="space-y-4">
      {filteredRewards.map((reward, index) => (
        <div 
          key={index}
          className="flex items-center gap-4 p-4 bg-white rounded-lg border"
        >
          <div className={`p-2 rounded-full ${
            reward.badge === 'gold' ? 'bg-yellow-100' :
            reward.badge === 'silver' ? 'bg-gray-100' :
            reward.badge === 'bronze' ? 'bg-orange-100' :
            'bg-purple-100'
          }`}>
            <Award className={`w-6 h-6 ${
              reward.badge === 'gold' ? 'text-yellow-600' :
              reward.badge === 'silver' ? 'text-gray-600' :
              reward.badge === 'bronze' ? 'text-orange-600' :
              'text-purple-600'
            }`} />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h4 className="font-medium">{reward.driverName}</h4>
              <span className="text-sm text-gray-500">
                {new Date(reward.date).toLocaleDateString()}
              </span>
            </div>
            <p className="text-sm text-gray-600">{reward.description}</p>
          </div>
          <div className="text-right">
            <div className="font-medium">{reward.points} pts</div>
            <div className="text-sm text-gray-500 capitalize">{reward.badge}</div>
          </div>
        </div>
      ))}
    </div>
  );
};

const RewardsTracking = ({ rewards }) => {
  const [selectedDriver, setSelectedDriver] = useState(null);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-500" />
          Driver Rewards & Recognition
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview">
          <TabsList className="w-full">
            <TabsTrigger value="overview" className="flex-1">Overview</TabsTrigger>
            <TabsTrigger value="leaderboard" className="flex-1">Leaderboard</TabsTrigger>
            <TabsTrigger value="achievements" className="flex-1">Achievements</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <RewardsSummaryCard 
                title="Perfect Attendance"
                count={rewards.filter(r => r.type === REWARD_TYPES.PERFECT_ATTENDANCE).length}
                icon={<Clock className="w-5 h-5 text-blue-500" />}
              />
              <RewardsSummaryCard 
                title="Safe Driving"
                count={rewards.filter(r => r.type === REWARD_TYPES.SAFE_DRIVING).length}
                icon={<Shield className="w-5 h-5 text-green-500" />}
              />
              <RewardsSummaryCard 
                title="Customer Rating"
                count={rewards.filter(r => r.type === REWARD_TYPES.CUSTOMER_RATING).length}
                icon={<Star className="w-5 h-5 text-yellow-500" />}
              />
            </div>
          </TabsContent>

          <TabsContent value="leaderboard" className="mt-4">
            <LeaderboardTable 
              rewards={rewards} 
              onDriverSelect={setSelectedDriver} 
            />
          </TabsContent>

          <TabsContent value="achievements" className="mt-4">
            <AchievementsList 
              rewards={rewards} 
              selectedDriver={selectedDriver} 
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default RewardsTracking;