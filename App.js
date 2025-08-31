import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TouchableHighlight,
  Pressable,
  SafeAreaView,
  ScrollView,
  Image,
  Modal,
  Alert,
  TextInput,
  Switch,
  useColorScheme,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import PetCareScreen from './PetCareScreen';


export default function App() {
  const PERSIST_KEYS = {
    currentPetId: 'PERSIST_CURRENT_PET_ID',
    settings: 'PERSIST_APP_SETTINGS',
    diaryEntries: 'PERSIST_DIARY_ENTRIES',
    lastClaimDate: 'PERSIST_LAST_CLAIM_DATE',
    iceCoins: 'PERSIST_ICE_COINS',
  };

  const [selectedPet, setSelectedPet] = useState(null);
  // 不再需要 imagesLoaded 狀態，直接顯示圖片
  // const [imagesLoaded, setImagesLoaded] = useState(false);
  const [showPetCare, setShowPetCare] = useState(false);
  const [showMyPets, setShowMyPets] = useState(false);
  
  // 每日登入獎勵狀態
  const [showDailyReward, setShowDailyReward] = useState(false);
  const [dailyRewardClaimed, setDailyRewardClaimed] = useState(false);
  const [lastClaimDate, setLastClaimDate] = useState(null);
  
  // 日記本狀態
  const [showDiary, setShowDiary] = useState(false);
  const [diaryContent, setDiaryContent] = useState('');
  const [diaryEntries, setDiaryEntries] = useState([]);
  const [showDiaryEntry, setShowDiaryEntry] = useState(false);
  const [selectedDiaryEntry, setSelectedDiaryEntry] = useState(null);
  const [showDiaryHistory, setShowDiaryHistory] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const [settings, setSettings] = useState({
    soundEnabled: true,
    hapticsEnabled: true,
    notificationsEnabled: false,
    reminderEnabled: false,
    reminderHour: 20,
    reminderMinute: 0,
    reminderConfirmed: false,
    theme: 'light',
    language: 'zh-TW', // 固定為繁體中文

  });
  // 簡易多語系
  const i18n = {
    'zh-TW': {
      appTitle: 'Pet Q',
      subtitle: '與你的毛小孩一起成長',
      panelTitle: '功能面板',
      menu_myPets: '毛小孩們',
      menu_gift: '禮物箱',
      menu_diary: '日記本',
      menu_settings: '設定',
      myPetsTitle: '🐾 毛小孩們',
      goToNurture: '前往養成',
      noPetSelected: '尚未選擇寵物',
      switchPartner: '切換夥伴',
      noNurturedPets: '尚無養成紀錄，選擇寵物開始養成吧！',
      dailyRewardTitle: '🎁 每日登入獎勵',
      dailyRewardDesc: '每日登入即可領取冰冰幣獎勵！',
      dailyRewardNoteClaimed: '今日已領取',
      dailyRewardNoteUnclaimed: '今日尚未領取',
      claimNow: '立即領取',
      claimed: '已領取',
      diaryTitle: '📝 今日日記',
      handwritingDiary: '✍️ 手寫日記',
      saveDiary: '保存日記',
      diaryHistory: '🗂 歷史紀錄',
      diaryNone: '尚無日記紀錄',
      viewDiary: '查看',
      delete: '刪除',
      diaryContentTitle: '📖 日記內容',
      diarySaveEmpty: '請先輸入日記內容',
      petQuotesTitle: '🐾 寵物語錄',
      todayStatsTitle: '📊 今日互動統計',
      stat_feed: '餵食次數',
      stat_clean: '清潔次數',
      stat_pet: '摸摸頭',
      stat_walk: '散步次數',
      stat_affection: '親密度提升',
      settingsTitle: '⚙️ 設定',
      appearance: '外觀',

      theme_light: '淺色', theme_dark: '深色', theme_system: '跟隨系統',
    },
    en: {
      appTitle: 'Pet Q',
      subtitle: 'Grow with your pet companions',
      panelTitle: 'Features',
      menu_myPets: 'My Pets',
      menu_gift: 'Gifts',
      menu_diary: 'Diary',
      menu_settings: 'Settings',
      myPetsTitle: '🐾 My Pets',
      goToNurture: 'Go to Nurturing',
      noPetSelected: 'No pet selected',
      switchPartner: 'Switch Partner',
      noNurturedPets: 'No nurturing records yet. Pick a pet to start!',
      dailyRewardTitle: '🎁 Daily Login Reward',
      dailyRewardDesc: 'Log in daily to get Ice Coins!',
      dailyRewardNoteClaimed: 'Claimed today',
      dailyRewardNoteUnclaimed: 'Not claimed today',
      claimNow: 'Claim Now',
      claimed: 'Claimed',
      diaryTitle: '📝 Today\'s Diary',
      handwritingDiary: '✍️ Handwritten Diary',
      saveDiary: 'Save Diary',
      diaryHistory: '🗂 History',
      diaryNone: 'No diary entries yet',
      viewDiary: 'View',
      delete: 'Delete',
      diaryContentTitle: '📖 Diary Entry',
      diarySaveEmpty: 'Please write something first',
      petQuotesTitle: '🐾 Pet Quotes',
      todayStatsTitle: '📊 Today\'s Interactions',
      stat_feed: 'Feeds',
      stat_clean: 'Cleans',
      stat_pet: 'Head Pats',
      stat_walk: 'Walks',
      stat_affection: 'Affection Gained',
      settingsTitle: '⚙️ Settings',
      appearance: 'Appearance',

      theme_light: 'Light', theme_dark: 'Dark', theme_system: 'System',
    },
  };
  const t = (key) => (i18n[settings.language] && i18n[settings.language][key]) || (i18n['zh-TW'][key] || key);
  const formatDiaryTimestamp = (isoText) => {
    try {
      const d = new Date(isoText);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const hh = String(d.getHours()).padStart(2, '0');
      const mm = String(d.getMinutes()).padStart(2, '0');
      return `${y}/${m}/${day} ${hh}:${mm}`;
    } catch (e) {
      return isoText || '';
    }
  };



  const TimestampChip = ({ iso }) => (
    <View style={{
      alignSelf: 'flex-start',
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.isDark ? '#0F172A' : '#DBEAFE',
      borderWidth: 2,
      borderColor: theme.isDark ? '#1E40AF' : '#93C5FD',
      borderRadius: 18,
      paddingVertical: 6,
      paddingHorizontal: 12,
      shadowColor: theme.isDark ? '#000' : '#3B82F6',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 3,
    }}>
      <Text style={{ color: theme.isDark ? '#93C5FD' : '#1E40AF', fontWeight: '700', fontSize: 11 }}>
        {formatDiaryTimestamp(iso)}
      </Text>
    </View>
  );



  // 主題（深色/淺色/系統）
  const systemColorScheme = useColorScheme && useColorScheme();
  const isDarkTheme = settings.theme === 'dark' ? true : settings.theme === 'light' ? false : (systemColorScheme === 'dark');
  const theme = {
    isDark: isDarkTheme,
    colors: isDarkTheme
      ? {
          background: '#121212',
          card: '#1E1E1E',
          panel: '#0F172A',
          text: '#EDEFF2',
          subText: '#B0BEC5',
          border: '#263238',
          inputBg: '#2A2A2A',
          placeholder: '#78909C',
        }
      : {
          background: '#FFFFFF',
          card: '#FFFFFF',
          panel: '#F0F8FF',
          text: '#333333',
          subText: '#666666',
          border: '#E3F2FD',
          inputBg: '#FFFFFF',
          placeholder: '#999999',
        },
  };
  const [exportData, setExportData] = useState('');
  const [importData, setImportData] = useState('');
  const [todayStats, setTodayStats] = useState({
    feedCount: 0,
    cleanCount: 0,
    petCount: 0,
    walkCount: 0,
    affectionGained: 0
  });
  const [petsWithRecords, setPetsWithRecords] = useState(new Set());
  const [scheduledReminderId, setScheduledReminderId] = useState(null);




  // 寵物語錄觸發狀態
  const [petQuoteTriggered, setPetQuoteTriggered] = useState(false);

  // 移除圖片載入延遲，讓圖片立即顯示

  // 寵物角色資料
  const pets = [
    {
      id: 1,
      name: 'T系寵物',
      image: require('./B/T.png'),
    },
    {
      id: 2,
      name: 'R系寵物',
      image: require('./B/R.png'),
    },
    {
      id: 3,
      name: 'P系寵物',
      image: require('./B/P.png'),
    },
    {
      id: 4,
      name: 'D系寵物',
      image: require('./B/D.png'),
    },
    {
      id: 5,
      name: 'C系寵物',
      image: require('./B/C.png'),
    },
  ];

  // 檢查寵物是否有遊玩紀錄的函數
  const checkPetRecords = async () => {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const petRecordKeys = keys.filter(k => 
        k.startsWith('PERSIST_PET_STATUS') || 
        k.startsWith('PERSIST_TRANSACTIONS') || 
        k.startsWith('PERSIST_DAILY_COUNTERS') ||
        k.startsWith('PERSIST_SAVED_MONEY') ||
        k.startsWith('PERSIST_BACKPACK')
      );
      
      // 如果有任何寵物相關的紀錄，檢查實際資料
      if (petRecordKeys.length > 0) {
        const petStatusData = await AsyncStorage.getItem('PERSIST_PET_STATUS');
        const transactionsData = await AsyncStorage.getItem('PERSIST_TRANSACTIONS');
        const dailyCountersData = await AsyncStorage.getItem('PERSIST_DAILY_COUNTERS');
        const savedMoneyData = await AsyncStorage.getItem('PERSIST_SAVED_MONEY');
        
        // 檢查是否有實際的遊玩數據（不只是初始值）
        let hasActualData = false;
        
        if (petStatusData) {
          try {
            const status = JSON.parse(petStatusData);
            // 如果寵物狀態不是初始值（30,30,30），就算有遊玩紀錄
            if (status.hunger !== 30 || status.cleanliness !== 30 || status.affection !== 30) {
              hasActualData = true;
            }
          } catch (e) {}
        }
        
        if (transactionsData) {
          try {
            const transactions = JSON.parse(transactionsData);
            // 如果有任何交易紀錄，就算有遊玩紀錄
            if (Array.isArray(transactions) && transactions.length > 0) {
              hasActualData = true;
            }
          } catch (e) {}
        }
        
        if (dailyCountersData) {
          try {
            const counters = JSON.parse(dailyCountersData);
            // 如果有任何計數器被使用過，就算有遊玩紀錄
            if (counters.feed > 0 || counters.clean > 0 || counters.pet > 0 || counters.walk > 0) {
              hasActualData = true;
            }
          } catch (e) {}
        }
        
        if (savedMoneyData) {
          try {
            const savedMoney = JSON.parse(savedMoneyData);
            // 如果有存錢紀錄，就算有遊玩紀錄
            if (savedMoney > 0) {
              hasActualData = true;
            }
          } catch (e) {}
        }
        
        // 如果有實際遊玩數據，就將當前寵物標記為有紀錄
        if (hasActualData) {
          const currentPetId = await AsyncStorage.getItem(PERSIST_KEYS.currentPetId);
          if (currentPetId) {
            setPetsWithRecords(prev => new Set([...prev, parseInt(currentPetId, 10)]));
          }
        }
      }
    } catch (e) {
      console.warn('check pet records error', e);
    }
  };

  // 啟動時還原已選擇的寵物與設定
  useEffect(() => {
    (async () => {
      try {

        // 載入已選寵物
        const idText = await AsyncStorage.getItem(PERSIST_KEYS.currentPetId);
        const idNum = idText ? parseInt(idText, 10) : null;
        if (idNum) {
          const found = pets.find(p => p.id === idNum);
          if (found) setSelectedPet(found);
        }
        
        // 載入設定
        const settingsJson = await AsyncStorage.getItem(PERSIST_KEYS.settings);
        if (settingsJson) {
          const parsedSettings = JSON.parse(settingsJson);
          setSettings(prev => ({ ...prev, ...parsedSettings }));
        }

        // 檢查寵物遊玩紀錄
        await checkPetRecords();

        // 載入日記歷史
        const diaryJson = await AsyncStorage.getItem(PERSIST_KEYS.diaryEntries);
        if (diaryJson) {
          try {
            const parsed = JSON.parse(diaryJson);
            if (Array.isArray(parsed)) setDiaryEntries(parsed);
          } catch (e) {}
        }

        // 載入最後領取日期
        const lastClaimText = await AsyncStorage.getItem(PERSIST_KEYS.lastClaimDate);
        if (lastClaimText) {
          setLastClaimDate(lastClaimText);
        }

        // 載入冰冰幣
        const iceCoinsText = await AsyncStorage.getItem(PERSIST_KEYS.iceCoins);
        if (iceCoinsText) {
          setIceCoins(parseInt(iceCoinsText, 10) || 0);
        }

        // 標記資料載入完成
        setDataLoaded(true);
      } catch (e) {
        console.warn('load data error', e);
        // 即使載入失敗，也要標記為完成，避免永遠不保存
        setDataLoaded(true);
      }
    })();
  }, []);

  // 設定變更時自動儲存
  useEffect(() => {
    (async () => {
      try {
        await AsyncStorage.setItem(PERSIST_KEYS.settings, JSON.stringify(settings));
      } catch (e) {
        console.warn('save settings error', e);
      }
    })();
  }, [settings]);

  // 用於追蹤資料是否已載入完成
  const [dataLoaded, setDataLoaded] = useState(false);

  // 日記歷史變更時自動儲存（只有在資料載入完成後才保存）
  useEffect(() => {
    if (!dataLoaded) return; // 資料尚未載入完成，不要保存
    
    (async () => {
      try {
        await AsyncStorage.setItem(PERSIST_KEYS.diaryEntries, JSON.stringify(diaryEntries));
      } catch (e) {
        console.warn('save diary entries error', e);
      }
    })();
  }, [diaryEntries, dataLoaded]);

  // 最後領取日期變更時自動儲存
  useEffect(() => {
    if (lastClaimDate) {
      (async () => {
        try {
          await AsyncStorage.setItem(PERSIST_KEYS.lastClaimDate, lastClaimDate);
        } catch (e) {
          console.warn('save last claim date error', e);
        }
      })();
    }
  }, [lastClaimDate]);

  // 冰冰幣變更時自動儲存
  useEffect(() => {
    (async () => {
      try {
        await AsyncStorage.setItem(PERSIST_KEYS.iceCoins, iceCoins.toString());
      } catch (e) {
        console.warn('save ice coins error', e);
      }
    })();
  }, [iceCoins]);

  // 根據提醒設定排程/取消每日提醒（若裝置已支援通知）
  // 提醒功能已移除

  // 首頁按鈕
  const menuButtons = [
    { id: 1, key: 'myPets', icon: '🐾', color: '#FF6B6B' },
    { id: 4, key: 'gift', icon: '🎁', color: '#96CEB4' },
    { id: 5, key: 'diary', icon: '📝', color: '#FFEAA7' },
    { id: 8, key: 'settings', icon: '⚙️', color: '#F7DC6F' },
  ];

  const handlePetSelect = (pet) => {
    setSelectedPet(pet);
    setShowPetCare(true); // 直接進入養成頁面
    AsyncStorage.setItem(PERSIST_KEYS.currentPetId, String(pet.id)).catch(() => {});
    // 選擇寵物後，將其標記為有遊玩紀錄（如果用戶開始養成的話）
    setPetsWithRecords(prev => new Set([...prev, pet.id]));
  };



  // 檢查每日登入獎勵
  const checkDailyReward = () => {
    const today = new Date().toDateString();
    const lastClaim = lastClaimDate ? new Date(lastClaimDate).toDateString() : null;
    
    if (lastClaim !== today) {
      setDailyRewardClaimed(false);
    } else {
      setDailyRewardClaimed(true);
    }
  };

  // 冰冰幣狀態（從 PetCareScreen 提升到 App 層級）
  const [iceCoins, setIceCoins] = useState(0);

  // 領取每日登入獎勵
  const claimDailyReward = () => {
    const today = new Date().toDateString();
    setLastClaimDate(today);
    setDailyRewardClaimed(true);
    setShowDailyReward(false);
    
    // 實際增加 20 冰冰幣
    setIceCoins(prev => prev + 20);
    
    Alert.alert(
      '🎉 領取成功！',
      '恭喜獲得 20 冰冰幣！\n記得明天再來領取喔！',
      [{ text: '確定', style: 'default' }]
    );
  };

  // 處理禮物箱按鈕點擊
  const handleGiftBox = () => {
    const today = new Date().toDateString();
    const lastClaim = lastClaimDate ? new Date(lastClaimDate).toDateString() : null;
    
    if (lastClaim === today) {
      // 今日已領取，顯示提示訊息
      Alert.alert(
        '🎁 今日已領取',
        '您今天已經領取過每日獎勵了！\n明天再來領取新的獎勵吧～',
        [{ text: '確定', style: 'default' }]
      );
    } else {
      // 尚未領取，顯示禮物箱
    checkDailyReward();
    setShowDailyReward(true);
    }
  };

  // 處理日記本按鈕點擊
  const handleDiary = () => {
    setShowDiary(true);
  };

  // 保存日記內容
  const saveDiary = (content) => {
    const text = (content || '').trim();
    if (!text) {
      Alert.alert('提示', t('diarySaveEmpty'));
      return;
    }
    const entry = { id: Date.now(), content: text, createdAt: new Date().toISOString() };
    setDiaryEntries(prev => [entry, ...prev]);
    setDiaryContent('');
    setShowDiary(false);
  };

  // 生成今日寵物語錄
  const generatePetQuote = () => {
    // 檢查是否所有互動次數都超過10次
    const isEligibleForQuote = 
      todayStats.feedCount > 10 && 
      todayStats.cleanCount > 10 && 
      todayStats.petCount > 10 && 
      todayStats.walkCount > 10;
    
    // 如果已經觸發過語錄，顯示感謝訊息
    if (petQuoteTriggered) {
      return "今天的心裡話已經告訴你了～明天再來聽我的新想法吧！";
    }
    
    // 如果條件未達成，顯示提示
    if (!isEligibleForQuote) {
      return "繼續和我互動吧～達到各項互動10次以上就能看到我的心裡話喔！";
    }
    
    // 達到條件且未觸發過，觸發語錄並設定已觸發狀態
    setPetQuoteTriggered(true);
    
    const quotes = [
      "最喜歡主人陪我玩耍的時光",
      "謝謝主人給我滿滿的愛",
      "你在我眼裡，不是主人，是家",
      "我想一直黏在你身邊",
      "主人～我不懂你的煩惱，只會跟你說：只要你需要，我都在",
      "最舒服的地方，不是我的窩，而是有你在的地方"
    ];
    return quotes[Math.floor(Math.random() * quotes.length)];
  };

  const renderHomeScreen = () => (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { backgroundColor: theme.isDark ? '#0B1220' : '#F8FBFF', borderBottomColor: theme.colors.border }]}>
        <Text style={styles.appTitle}>{t('appTitle')}</Text>
        <Text style={[styles.subtitle, { color: theme.colors.subText }]}>{t('subtitle')}</Text>
      </View>

      <ScrollView style={styles.petList} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>選擇你的寵物夥伴</Text>
        {pets.map((pet) => (
          <TouchableOpacity
            key={pet.id}
            style={styles.petCard}
            onPress={() => handlePetSelect(pet)}
          >
            <Image 
              source={pet.image} 
              style={styles.petImage}
              resizeMode="contain"
              fadeDuration={200}
              onError={(error) => {
                console.log(`圖片載入失敗: ${pet.name}`, error);
              }}
              onLoad={() => {
                console.log(`圖片載入成功: ${pet.name}`);
              }}
            />
            <View style={styles.petInfo}>
              <Text style={[styles.petName, { color: theme.colors.text }]}>{pet.name}</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#666" />
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* 功能面板 */}
      <View style={[styles.functionPanel, { backgroundColor: theme.colors.panel }]}>
        <Text style={[styles.panelTitle, { color: theme.colors.text }]}>{t('panelTitle')}</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.buttonRow}>
            {menuButtons.map((button) => (
              <TouchableOpacity 
                key={button.id} 
                style={[
                  styles.menuButton,
                  { zIndex: 1000 },
                  theme.isDark && { backgroundColor: '#1E293B', borderWidth: 1, borderColor: '#334155', shadowColor: '#000' }
                ]}
                activeOpacity={0.7}
                onPress={() => {
                  const key = button.key;
                  if (key === 'gift') {
                    console.log('執行禮物箱功能');
                    handleGiftBox();
                  } else if (key === 'diary') {
                    console.log('執行日記本功能');
                    handleDiary();
                  } else if (key === 'myPets') {
                    if (selectedPet) {
                      setShowMyPets(true);
                    } else {
                      Alert.alert('提示', '請先選擇一隻寵物再查看毛小孩們');
                    }
                  } else if (key === 'settings') {
                    setShowSettings(true);
                  }
                }}
              >
                <Text style={[styles.buttonIcon, theme.isDark && { color: '#EDEFF2' }]}>{button.icon}</Text>
                <Text style={[styles.buttonText, { color: theme.colors.text }]}>
                  {button.key === 'myPets' ? t('menu_myPets')
                    : button.key === 'gift' ? t('menu_gift')
                    : button.key === 'diary' ? t('menu_diary')
                    : t('menu_settings')}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* 毛小孩們模態框 */}
      <Modal
        visible={showMyPets}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowMyPets(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.diaryModal, { backgroundColor: theme.colors.card }]}>
            <View style={styles.diaryHeader}>
              <Text style={[styles.diaryTitle, { color: theme.isDark ? '#90CAF9' : '#1976D2' }]}>🐾 毛小孩們</Text>
              <TouchableOpacity onPress={() => setShowMyPets(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            <View style={{ padding: 20 }}>
              <View style={{ alignItems: 'center', marginBottom: 16 }}>
                {selectedPet ? (
                  <>
                    <Image source={selectedPet.image} style={{ width: 140, height: 140, borderRadius: 18, marginBottom: 10 }} />
                    <Text style={{ fontSize: 18, fontWeight: 'bold', color: theme.colors.text, marginBottom: 10 }}>{selectedPet.name}</Text>
                    <TouchableOpacity
                      onPress={() => { setShowMyPets(false); setShowPetCare(true); }}
                      style={{ backgroundColor: '#1976D2', borderRadius: 20, paddingVertical: 10, paddingHorizontal: 16 }}
                    >
                      <Text style={{ color: 'white', fontSize: 14, fontWeight: 'bold' }}>前往養成</Text>
                    </TouchableOpacity>
                  </>
                ) : (
                  <Text style={{ fontSize: 16, color: theme.colors.subText }}>尚未選擇寵物</Text>
                )}
              </View>

              {petsWithRecords.size > 0 && (
                <>
                  <Text style={{ fontSize: 14, color: theme.colors.subText, marginBottom: 8 }}>切換夥伴</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View style={{ flexDirection: 'row', gap: 12 }}>
                      {pets.filter(p => petsWithRecords.has(p.id)).map((p) => (
                        <TouchableOpacity
                          key={p.id}
                          onPress={() => { setSelectedPet(p); AsyncStorage.setItem('PERSIST_CURRENT_PET_ID', String(p.id)).catch(() => {}); }}
                          style={{
                            alignItems: 'center',
                            padding: 8,
                            borderRadius: 12,
                            borderWidth: selectedPet && selectedPet.id === p.id ? 2 : 1,
                            borderColor: selectedPet && selectedPet.id === p.id ? '#1976D2' : '#E0E0E0',
                            backgroundColor: '#FFFFFF',
                          }}
                        >
                          <Image source={p.image} style={{ width: 64, height: 64, borderRadius: 10, marginBottom: 6 }} />
                          <Text style={{ fontSize: 12, color: theme.colors.text }}>{p.name}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </ScrollView>
                </>
              )}
              {petsWithRecords.size === 0 && (
                <Text style={{ fontSize: 14, color: theme.colors.subText, textAlign: 'center', marginTop: 10 }}>
                  尚無養成紀錄，選擇寵物開始養成吧！
                </Text>
              )}
            </View>
          </View>
        </View>
      </Modal>

      {/* 日記內容檢視模態框 */}
      <Modal
        visible={showDiaryEntry}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowDiaryEntry(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.diaryModal, { backgroundColor: theme.colors.card }]}> 
            <View style={styles.diaryHeader}>
              <Text style={[styles.diaryTitle, { color: theme.isDark ? '#90CAF9' : '#1976D2' }]}>{t('diaryContentTitle')}</Text>
              <TouchableOpacity onPress={() => setShowDiaryEntry(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.diaryContent}>
              {selectedDiaryEntry ? (
                <>
                  <TimestampChip iso={selectedDiaryEntry.createdAt} />
                  <View style={{ height: 10 }} />
                  <Text style={{ color: theme.colors.text, fontSize: 14, lineHeight: 20 }}>
                    {selectedDiaryEntry.content}
                  </Text>
                </>
              ) : null}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* 每日登入獎勵模態框 */}
      <Modal
        visible={showDailyReward}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowDailyReward(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.rewardModal, { backgroundColor: theme.colors.card }]}>
            <View style={styles.rewardHeader}>
              <Text style={[styles.rewardTitle, { color: theme.isDark ? '#90CAF9' : '#1976D2' }]}>🎁 每日登入獎勵</Text>
              <TouchableOpacity 
                onPress={() => setShowDailyReward(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <View style={styles.rewardContent}>
              <View style={styles.rewardIconContainer}>
                <Image 
                  source={require('./B/M.png')} 
                  style={styles.rewardIcon}
                  resizeMode="contain"
                />
                <Text style={styles.rewardAmount}>+20</Text>
              </View>
              
              <Text style={[styles.rewardDescription, { color: theme.colors.text }]}>
                每日登入即可領取冰冰幣獎勵！
              </Text>
              
              <Text style={[styles.rewardNote, { color: theme.colors.subText }]}>
                {dailyRewardClaimed ? '今日已領取' : '今日尚未領取'}
              </Text>
            </View>

            <TouchableOpacity 
              style={[
                styles.claimButton,
                dailyRewardClaimed && styles.claimedButton
              ]}
              onPress={claimDailyReward}
              disabled={dailyRewardClaimed}
            >
              <Text style={styles.claimButtonText}>
                {dailyRewardClaimed ? '已領取' : '立即領取'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* 日記本模態框 */}
      <Modal
        visible={showDiary}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowDiary(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.diaryModal, { backgroundColor: theme.colors.card }]}>
            <View style={styles.diaryHeader}>
              <Text style={[styles.diaryTitle, { color: theme.isDark ? '#90CAF9' : '#1976D2' }]}>📝 今日日記</Text>
              <TouchableOpacity onPress={() => setShowDiary(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.diaryContent}>
              {/* 手寫日記區塊 */}
              <View style={styles.diarySection}>
                <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>✍️ 手寫日記</Text>
                <View style={[styles.diaryInputContainer, theme.isDark && { backgroundColor: '#0B1220', borderColor: '#334155' }]}>
                  <TextInput
                    style={[styles.diaryInput, { color: theme.colors.text }]}
                    placeholder="寫下今天的心情..."
                    multiline={true}
                    value={diaryContent}
                    onChangeText={setDiaryContent}
                    placeholderTextColor={theme.isDark ? '#94A3B8' : '#999'}
                  />
                </View>
                <TouchableOpacity 
                  style={styles.saveButton}
                  onPress={() => saveDiary(diaryContent)}
                >
                  <Text style={styles.saveButtonText}>保存日記</Text>
                </TouchableOpacity>
              </View>

              {/* 歷史紀錄按鈕（導向全螢幕頁面） */}
              <View style={styles.diarySection}>
                <TouchableOpacity 
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    alignSelf: 'flex-start',
                    backgroundColor: theme.isDark ? '#581C87' : '#F3E8FF',
                    borderWidth: 2,
                    borderColor: theme.isDark ? '#8B5CF6' : '#C4B5FD',
                    borderRadius: 20,
                    paddingVertical: 10,
                    paddingHorizontal: 16,
                    shadowColor: theme.isDark ? '#000' : '#8B5CF6',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.2,
                    shadowRadius: 4,
                    elevation: 3,
                  }}
                  onPress={() => { setShowDiary(false); setShowDiaryHistory(true); }}
                >
                  <Text style={{ 
                    color: theme.isDark ? '#C4B5FD' : '#6B21A8', 
                    fontWeight: '700', 
                    fontSize: 14 
                  }}>{t('diaryHistory')}</Text>
                </TouchableOpacity>
              </View>

              {/* 寵物語錄區塊 */}
              <View style={styles.diarySection}>
                <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>🐾 寵物語錄</Text>
                <View style={[styles.quoteContainer, theme.isDark && { backgroundColor: '#0B1220', borderColor: '#334155' }]}>
                  <Text style={[styles.quoteText, { color: theme.colors.text }]}>{generatePetQuote()}</Text>
                </View>
              </View>

              {/* 今日互動統計 */}
              <View style={styles.diarySection}>
                <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>📊 今日互動統計</Text>
                <View style={[styles.statsContainer, theme.isDark && { backgroundColor: '#0B1220', borderWidth: 1, borderColor: '#334155' }]}>
                  <View style={[styles.statItem, theme.isDark && { borderBottomColor: '#334155' }]}>
                    <Text style={styles.statIcon}>🍖</Text>
                    <Text style={[styles.statLabel, { color: theme.colors.text, fontWeight: '600' }]}>餵食次數</Text>
                    <Text style={[styles.statValue, { color: theme.isDark ? '#FFFFFF' : '#0D47A1' }]}>{todayStats.feedCount} 次</Text>
                  </View>
                  
                  <View style={[styles.statItem, theme.isDark && { borderBottomColor: '#334155' }]}>
                    <Text style={styles.statIcon}>🧼</Text>
                    <Text style={[styles.statLabel, { color: theme.colors.text, fontWeight: '600' }]}>清潔次數</Text>
                    <Text style={[styles.statValue, { color: theme.isDark ? '#FFFFFF' : '#0D47A1' }]}>{todayStats.cleanCount} 次</Text>
                  </View>
                  
                  <View style={[styles.statItem, theme.isDark && { borderBottomColor: '#334155' }]}>
                    <Text style={styles.statIcon}>✋</Text>
                    <Text style={[styles.statLabel, { color: theme.colors.text, fontWeight: '600' }]}>摸摸頭</Text>
                    <Text style={[styles.statValue, { color: theme.isDark ? '#FFFFFF' : '#0D47A1' }]}>{todayStats.petCount} 次</Text>
                  </View>
                  
                  <View style={[styles.statItem, theme.isDark && { borderBottomColor: '#334155' }]}>
                    <Text style={styles.statIcon}>🌲</Text>
                    <Text style={[styles.statLabel, { color: theme.colors.text, fontWeight: '600' }]}>散步次數</Text>
                    <Text style={[styles.statValue, { color: theme.isDark ? '#FFFFFF' : '#0D47A1' }]}>{todayStats.walkCount} 次</Text>
                  </View>
                  
                  <View style={styles.statItem}>
                    <Text style={styles.statIcon}>💗</Text>
                    <Text style={[styles.statLabel, { color: theme.colors.text, fontWeight: '600' }]}>親密度提升</Text>
                    <Text style={[styles.statValue, { color: theme.isDark ? '#FFFFFF' : '#0D47A1' }]}>+{todayStats.affectionGained}</Text>
                  </View>
                </View>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* 設定模態框 */}
      <Modal
        visible={showSettings}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowSettings(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.diaryModal, { backgroundColor: theme.colors.card }]}>
            <View style={styles.diaryHeader}>
              <Text style={[styles.diaryTitle, { color: theme.isDark ? '#90CAF9' : '#1976D2' }]}>⚙️ 設定</Text>
              <TouchableOpacity onPress={() => setShowSettings(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ padding: 20 }}>
              {/* 外觀 */}
              <View style={styles.settingsSection}>
                <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>外觀</Text>
                <View style={{ flexDirection: 'row' }}>
                  {['light','dark','system'].map(mode => (
                    <TouchableOpacity
                      key={mode}
                      onPress={() => setSettings(s => ({ ...s, theme: mode }))}
                      style={[
                        styles.choiceChip,
                        settings.theme === mode && styles.choiceChipActive,
                        { marginRight: 8, backgroundColor: theme.isDark ? '#263238' : '#F0F4F8', borderColor: theme.isDark ? '#455A64' : '#E0E0E0' }
                      ]}
                    >
                      <Text style={[
                        styles.choiceChipText,
                        settings.theme === mode && styles.choiceChipTextActive,
                        !(['dark','light','system'].includes(settings.theme) && settings.theme === mode) && { color: theme.colors.text }
                      ]}>
                        {mode === 'light' ? '淺色' : mode === 'dark' ? '深色' : '跟隨系統'}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>


            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );



  // 主要的應用程式邏輯
  if (showPetCare && selectedPet) {
    return (
      <PetCareScreen
        selectedPet={selectedPet}
        onBack={() => setShowPetCare(false)}
        dailyRewardClaimed={dailyRewardClaimed}
        onDailyRewardClaimed={() => setDailyRewardClaimed(false)}
        todayStats={todayStats}
        setTodayStats={setTodayStats}
        petQuoteTriggered={petQuoteTriggered}
        setPetQuoteTriggered={setPetQuoteTriggered}
        isDarkTheme={theme.isDark}
        language={settings.language}
        iceCoins={iceCoins}
        setIceCoins={setIceCoins}
      />
    );
  } else if (showDiaryHistory) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}> 
        <View style={[styles.header, { backgroundColor: theme.isDark ? '#0B1220' : '#F8FBFF', borderBottomColor: theme.colors.border }]}> 
          <TouchableOpacity onPress={() => setShowDiaryHistory(false)} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#1976D2" />
          </TouchableOpacity>
          <Text style={styles.title}>{t('diaryHistory')}</Text>
        </View>

        <ScrollView style={{ padding: 20 }}>
          {diaryEntries.length === 0 ? (
            <Text style={{ color: theme.colors.subText, textAlign: 'center', marginTop: 30 }}>{t('diaryNone')}</Text>
          ) : (
            diaryEntries.map(entry => (
              <View key={entry.id} style={{
                backgroundColor: theme.isDark ? '#0B1220' : '#F8FBFF',
                borderWidth: 1,
                borderColor: theme.isDark ? '#334155' : '#E3F2FD',
                borderRadius: 12,
                padding: 14,
                marginBottom: 12,
              }}>
                <TimestampChip iso={entry.createdAt} />
                <View style={{ height: 6 }} />
                <Text style={{ color: theme.colors.text, marginBottom: 10 }} numberOfLines={3}>
                  {entry.content}
                </Text>
                <View style={{ flexDirection: 'row' }}>
                  <TouchableOpacity
                    onPress={() => { setSelectedDiaryEntry(entry); setShowDiaryEntry(true); }}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      backgroundColor: theme.isDark ? '#0F172A' : '#DBEAFE',
                      borderWidth: 2,
                      borderColor: theme.isDark ? '#1E40AF' : '#93C5FD',
                      borderRadius: 20,
                      paddingVertical: 8,
                      paddingHorizontal: 14,
                      marginRight: 8,
                      shadowColor: theme.isDark ? '#000' : '#3B82F6',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.2,
                      shadowRadius: 4,
                      elevation: 3,
                    }}
                  >
                    <Text style={{ marginRight: 4, fontSize: 12 }}>👀</Text>
                    <Text style={{ 
                      color: theme.isDark ? '#93C5FD' : '#1E40AF', 
                      fontWeight: '700', 
                      fontSize: 12 
                    }}>{t('viewDiary')}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => {
                      Alert.alert('刪除確認', '確定要刪除此日記嗎？', [
                        { text: '取消', style: 'cancel' },
                        { text: t('delete'), style: 'destructive', onPress: () => setDiaryEntries(prev => prev.filter(e => e.id !== entry.id)) }
                      ]);
                    }}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      backgroundColor: theme.isDark ? '#7F1D1D' : '#FEE2E2',
                      borderWidth: 2,
                      borderColor: theme.isDark ? '#EF4444' : '#FECACA',
                      borderRadius: 20,
                      paddingVertical: 8,
                      paddingHorizontal: 14,
                      shadowColor: theme.isDark ? '#000' : '#EF4444',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.2,
                      shadowRadius: 4,
                      elevation: 3,
                    }}
                  >
                    <Text style={{ marginRight: 4, fontSize: 12 }}>🗑️</Text>
                    <Text style={{ 
                      color: theme.isDark ? '#FECACA' : '#DC2626', 
                      fontWeight: '700', 
                      fontSize: 12 
                    }}>{t('delete')}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </ScrollView>

        {/* 日記內容檢視模態框（歷史頁也可查看） */}
        <Modal
          visible={showDiaryEntry}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowDiaryEntry(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.diaryModal, { backgroundColor: theme.colors.card }]}> 
              <View style={styles.diaryHeader}>
                <Text style={[styles.diaryTitle, { color: theme.isDark ? '#90CAF9' : '#1976D2' }]}>{t('diaryContentTitle')}</Text>
                <TouchableOpacity onPress={() => setShowDiaryEntry(false)}>
                  <Ionicons name="close" size={24} color="#666" />
                </TouchableOpacity>
              </View>
              <ScrollView style={styles.diaryContent}>
                {selectedDiaryEntry ? (
                  <>
                    <TimestampChip iso={selectedDiaryEntry.createdAt} />
                    <View style={{ height: 10 }} />
                    <Text style={{ color: theme.colors.text, fontSize: 14, lineHeight: 20 }}>
                      {selectedDiaryEntry.content}
                    </Text>
                  </>
                ) : null}
              </ScrollView>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    );
  } else {
    return renderHomeScreen();
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 20,
    backgroundColor: '#F8FBFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E3F2FD',
  },
  appTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#6366F1',          // 現代紫色
    marginBottom: 5,
    textAlign: 'center',
    letterSpacing: 0.5,
    textShadowColor: 'rgba(99, 102, 241, 0.15)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1976D2',
  },
  backButton: {
    position: 'absolute',
    left: 20,
    top: 20,
    padding: 5,
  },
  petList: {
    flex: 1,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  petCard: {
    flexDirection: 'row',
    backgroundColor: '#F8FBFF',
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  petImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 15,
  },
  petInfo: {
    flex: 1,
  },
  petName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },

  functionPanel: {
    backgroundColor: '#F0F8FF',
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  panelTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1976D2',
    marginBottom: 15,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 15,
  },
  menuButton: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    minWidth: 80,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonIcon: {
    fontSize: 24,
    marginBottom: 5,
  },
  buttonText: {
    fontSize: 10,
    color: '#333',
    fontWeight: '600',
    textAlign: 'center',
  },

  statusInfo: {
    width: '100%',
    backgroundColor: '#F8FBFF',
    borderRadius: 15,
    padding: 20,
    marginBottom: 30,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  statusItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  statusLabel: {
    fontSize: 14,
    color: '#666',
  },
  statusValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1976D2',
  },
  startButton: {
    backgroundColor: '#1976D2',
    borderRadius: 25,
    paddingVertical: 15,
    paddingHorizontal: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  startButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  imagePlaceholder: {
    width: 80,
    height: 80,
    backgroundColor: '#F0F0F0',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  loadingText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rewardModal: {
    backgroundColor: 'white',
    borderRadius: 20,
    width: '85%',
    maxWidth: 350,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  rewardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  rewardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1976D2',
  },
  closeButton: {
    padding: 5,
  },
  rewardContent: {
    padding: 20,
    alignItems: 'center',
  },
  rewardIconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  rewardIcon: {
    width: 40,
    height: 40,
    marginRight: 10,
  },
  rewardAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1976D2',
  },
  rewardDescription: {
    fontSize: 16,
    color: '#424242',
    textAlign: 'center',
    marginBottom: 10,
  },
  rewardNote: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  claimButton: {
    backgroundColor: '#1976D2',
    borderRadius: 25,
    paddingVertical: 15,
    paddingHorizontal: 30,
    margin: 20,
    alignItems: 'center',
  },
  claimedButton: {
    backgroundColor: '#BDBDBD',
  },
  claimButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  settingsSection: {
    marginBottom: 24,
  },
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  settingsLabel: {
    fontSize: 14,
    color: '#333',
  },
  choiceChip: {
    backgroundColor: '#F0F4F8',
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  choiceChipActive: {
    backgroundColor: '#1976D2',
    borderColor: '#1976D2',
  },
  choiceChipText: {
    fontSize: 12,
    color: '#333',
    fontWeight: '600',
  },
  choiceChipTextActive: {
    color: '#FFFFFF',
  },
  primaryButton: {
    backgroundColor: '#1976D2',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 12,
  },
  sectionSubTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  settingsInputRow: {
    marginBottom: 16,
  },
  settingsInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    backgroundColor: '#FFFFFF',
  },
  timePickerContainer: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  timeDisplayContainer: {
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  timeDisplayText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  timePickerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-start',
    gap: 8,
  },
  timeSliderContainer: {
    alignItems: 'center',
    flex: 1,
  },
  timeSliderHeader: {
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    width: '100%',
    alignItems: 'center',
  },
  timeSliderTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#666',
  },
  timeSliderWrapper: {
    position: 'relative',
    width: '100%',
  },
  timeSlider: {
    height: 140,
    width: '100%',
    borderWidth: 1,
    borderTopWidth: 0,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    backgroundColor: '#FFFFFF',
  },
  centerIndicator: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: '50%',
    height: 48,
    borderWidth: 2,
    borderRadius: 8,
    marginTop: -24,
    backgroundColor: 'transparent',
    opacity: 0.3,
  },
  timeSeparator: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
    marginTop: 40,
  },
  timeSeparatorText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  timeOption: {
    height: 48,
    paddingVertical: 12,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    marginVertical: 0,
    marginHorizontal: 6,
  },
  timeOptionActive: {
    backgroundColor: '#2196F3',
  },
  timeOptionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  timeOptionTextActive: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  exportBox: {
    backgroundColor: '#F8FBFF',
    borderWidth: 1,
    borderColor: '#E3F2FD',
    borderRadius: 12,
    padding: 10,
    marginTop: 10,
  },
  exportLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 6,
  },
  exportText: {
    fontSize: 12,
    color: '#424242',
  },
  importBox: {
    backgroundColor: '#FFF8F0',
    borderWidth: 1,
    borderColor: '#FFB74D',
    borderRadius: 12,
    padding: 10,
    marginTop: 12,
  },
  importInput: {
    minHeight: 80,
    fontSize: 12,
    color: '#424242',
    textAlignVertical: 'top',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginBottom: 10,
  },
  diaryModal: {
    backgroundColor: 'white',
    borderRadius: 20,
    width: '95%',
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  diaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  diaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1976D2',
  },
  diaryContent: {
    padding: 20,
  },
  diarySection: {
    marginBottom: 25,
  },
  diaryInputContainer: {
    backgroundColor: '#F8FBFF',
    borderRadius: 15,
    padding: 15,
    borderWidth: 1,
    borderColor: '#E3F2FD',
  },
  diaryInput: {
    minHeight: 100,
    fontSize: 14,
    color: '#424242',
    textAlignVertical: 'top',
  },
  saveButton: {
    backgroundColor: '#1976D2',
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 25,
    alignItems: 'center',
    marginTop: 15,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  quoteContainer: {
    backgroundColor: '#FFF3E0',
    borderRadius: 15,
    padding: 20,
    borderWidth: 1,
    borderColor: '#FFB74D',
  },
  quoteText: {
    fontSize: 16,
    color: '#424242',
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 22,
  },
  statsContainer: {
    backgroundColor: '#F8FBFF',
    borderRadius: 15,
    padding: 15,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  statIcon: {
    fontSize: 20,
    width: 30,
  },
  statLabel: {
    flex: 1,
    fontSize: 14,
    color: '#666',
    marginLeft: 10,
  },
  statValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1976D2',
  },

});
    