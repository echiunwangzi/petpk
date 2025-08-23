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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import PetCareScreen from './PetCareScreen';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('home');
  const [selectedPet, setSelectedPet] = useState(null);
  // 不再需要 imagesLoaded 狀態，直接顯示圖片
  // const [imagesLoaded, setImagesLoaded] = useState(false);
  const [showPetCare, setShowPetCare] = useState(false);
  
  // 每日登入獎勵狀態
  const [showDailyReward, setShowDailyReward] = useState(false);
  const [dailyRewardClaimed, setDailyRewardClaimed] = useState(false);
  const [lastClaimDate, setLastClaimDate] = useState(null);
  
  // 日記本狀態
  const [showDiary, setShowDiary] = useState(false);
  const [diaryContent, setDiaryContent] = useState('');
  const [todayStats, setTodayStats] = useState({
    feedCount: 0,
    cleanCount: 0,
    petCount: 0,
    walkCount: 0,
    affectionGained: 0
  });

  // 寵物語錄觸發狀態
  const [petQuoteTriggered, setPetQuoteTriggered] = useState(false);

  // 移除圖片載入延遲，讓圖片立即顯示

  // 寵物角色資料
  const pets = [
    {
      id: 1,
      name: 'T系寵物',
      personality: '穩重可靠',
      description: '堅硬外殼為你阻擋一切',
      image: require('./B/T.png'),
    },
    {
      id: 2,
      name: 'R系寵物',
      personality: '活潑可愛',
      description: '表面呆萌，實則機靈爆棚',
      image: require('./B/R.png'),
    },
    {
      id: 3,
      name: 'P系寵物',
      personality: '調皮有趣',
      description: '表面在發呆，腦內在開派對',
      image: require('./B/P.png'),
    },
    {
      id: 4,
      name: 'D系寵物',
      personality: '忠誠勇敢',
      description: '是戰友也是朋友',
      image: require('./B/D.png'),
    },
    {
      id: 5,
      name: 'C系寵物',
      personality: '神秘優雅',
      description: '今天高冷，明天撒嬌，誰知道呢？',
      image: require('./B/C.png'),
    },
  ];

  // 首頁按鈕
  const menuButtons = [
    { id: 1, icon: '🐾', title: '毛小孩們', color: '#FF6B6B' },
    { id: 4, icon: '🎁', title: '禮物箱', color: '#96CEB4' },
    { id: 5, icon: '📝', title: '日記本', color: '#FFEAA7' },
    { id: 8, icon: '⚙️', title: '設定', color: '#F7DC6F' },
  ];

  const handlePetSelect = (pet) => {
    setSelectedPet(pet);
    setCurrentScreen('detail');
  };

  const handleBack = () => {
    setCurrentScreen('home');
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

  // 領取每日登入獎勵
  const claimDailyReward = () => {
    const today = new Date().toDateString();
    setLastClaimDate(today);
    setDailyRewardClaimed(true);
    setShowDailyReward(false);
    
    Alert.alert(
      '🎉 領取成功！',
      '恭喜獲得 20 冰冰幣！\n記得明天再來領取喔！',
      [{ text: '確定', style: 'default' }]
    );
  };

  // 處理禮物箱按鈕點擊
  const handleGiftBox = () => {
    checkDailyReward();
    setShowDailyReward(true);
  };

  // 處理日記本按鈕點擊
  const handleDiary = () => {
    setShowDiary(true);
  };

  // 保存日記內容
  const saveDiary = (content) => {
    setDiaryContent(content);
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
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.appTitle}>寵物軍團</Text>
        <Text style={styles.subtitle}>與你的毛小孩一起成長</Text>
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
              <Text style={styles.petName}>{pet.name}</Text>
              <Text style={styles.petPersonality}>{pet.personality}</Text>
              <Text style={styles.petDescription}>{pet.description}</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#666" />
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* 功能面板 */}
      <View style={styles.functionPanel}>
        <Text style={styles.panelTitle}>功能面板</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.buttonRow}>
            {menuButtons.map((button) => (
              <TouchableOpacity 
                key={button.id} 
                style={[styles.menuButton, { zIndex: 1000 }]}
                activeOpacity={0.7}
                onPress={() => {
                  console.log('按鈕被點擊:', button.title);
                  if (button.title === '禮物箱') {
                    console.log('執行禮物箱功能');
                    handleGiftBox();
                  } else if (button.title === '日記本') {
                    console.log('執行日記本功能');
                    handleDiary();
                  }
                }}
              >
                <Text style={styles.buttonIcon}>{button.icon}</Text>
                <Text style={styles.buttonText}>{button.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* 每日登入獎勵模態框 */}
      <Modal
        visible={showDailyReward}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowDailyReward(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.rewardModal}>
            <View style={styles.rewardHeader}>
              <Text style={styles.rewardTitle}>🎁 每日登入獎勵</Text>
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
              
              <Text style={styles.rewardDescription}>
                每日登入即可領取冰冰幣獎勵！
              </Text>
              
              <Text style={styles.rewardNote}>
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
          <View style={styles.diaryModal}>
            <View style={styles.diaryHeader}>
              <Text style={styles.diaryTitle}>📝 今日日記</Text>
              <TouchableOpacity onPress={() => setShowDiary(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.diaryContent}>
              {/* 手寫日記區塊 */}
              <View style={styles.diarySection}>
                <Text style={styles.sectionTitle}>✍️ 手寫日記</Text>
                <View style={styles.diaryInputContainer}>
                  <TextInput
                    style={styles.diaryInput}
                    placeholder="寫下今天的心情..."
                    multiline={true}
                    value={diaryContent}
                    onChangeText={setDiaryContent}
                    placeholderTextColor="#999"
                  />
                </View>
                <TouchableOpacity 
                  style={styles.saveButton}
                  onPress={() => saveDiary(diaryContent)}
                >
                  <Text style={styles.saveButtonText}>保存日記</Text>
                </TouchableOpacity>
              </View>

              {/* 寵物語錄區塊 */}
              <View style={styles.diarySection}>
                <Text style={styles.sectionTitle}>🐾 寵物語錄</Text>
                <View style={styles.quoteContainer}>
                  <Text style={styles.quoteText}>{generatePetQuote()}</Text>
                </View>
              </View>

              {/* 今日互動統計 */}
              <View style={styles.diarySection}>
                <Text style={styles.sectionTitle}>📊 今日互動統計</Text>
                <View style={styles.statsContainer}>
                  <View style={styles.statItem}>
                    <Text style={styles.statIcon}>🍖</Text>
                    <Text style={styles.statLabel}>餵食次數</Text>
                    <Text style={styles.statValue}>{todayStats.feedCount} 次</Text>
                  </View>
                  
                  <View style={styles.statItem}>
                    <Text style={styles.statIcon}>🧼</Text>
                    <Text style={styles.statLabel}>清潔次數</Text>
                    <Text style={styles.statValue}>{todayStats.cleanCount} 次</Text>
                  </View>
                  
                  <View style={styles.statItem}>
                    <Text style={styles.statIcon}>✋</Text>
                    <Text style={styles.statLabel}>摸摸頭</Text>
                    <Text style={styles.statValue}>{todayStats.petCount} 次</Text>
                  </View>
                  
                  <View style={styles.statItem}>
                    <Text style={styles.statIcon}>🌲</Text>
                    <Text style={styles.statLabel}>散步次數</Text>
                    <Text style={styles.statValue}>{todayStats.walkCount} 次</Text>
                  </View>
                  
                  <View style={styles.statItem}>
                    <Text style={styles.statIcon}>💗</Text>
                    <Text style={styles.statLabel}>親密度提升</Text>
                    <Text style={styles.statValue}>+{todayStats.affectionGained}</Text>
                  </View>
                </View>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );

  const renderDetailScreen = () => (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1976D2" />
        </TouchableOpacity>
        <Text style={styles.title}>角色詳細資訊</Text>
      </View>

      <View style={styles.detailContent}>
        <Image 
          source={selectedPet.image} 
          style={styles.detailPetImage}
          resizeMode="contain"
          fadeDuration={200}
          onError={(error) => console.log(`詳細頁面圖片載入失敗: ${selectedPet.name}`, error)}
          onLoad={() => console.log(`詳細頁面圖片載入成功: ${selectedPet.name}`)}
        />
        <Text style={styles.detailPetName}>{selectedPet.name}</Text>
        <Text style={styles.detailPersonality}>{selectedPet.personality}</Text>
        <Text style={styles.detailDescription}>{selectedPet.description}</Text>
        
        <View style={styles.statusInfo}>
          <Text style={styles.statusTitle}>初始狀態</Text>
          <View style={styles.statusItem}>
            <Text style={styles.statusLabel}>🍖 飢餓度</Text>
            <Text style={styles.statusValue}>30%</Text>
          </View>
          <View style={styles.statusItem}>
            <Text style={styles.statusLabel}>🧼 清潔度</Text>
            <Text style={styles.statusValue}>30%</Text>
          </View>
          <View style={styles.statusItem}>
            <Text style={styles.statusLabel}>💗 親密度</Text>
            <Text style={styles.statusValue}>30%</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.startButton} onPress={() => setShowPetCare(true)}>
          <Text style={styles.startButtonText}>開始養成</Text>
        </TouchableOpacity>
      </View>
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
      />
    );
  } else if (currentScreen === 'detail') {
    return renderDetailScreen();
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
    fontWeight: 'bold',
    color: '#1976D2',
    marginBottom: 5,
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
  petPersonality: {
    fontSize: 14,
    color: '#1976D2',
    marginBottom: 5,
  },
  petDescription: {
    fontSize: 12,
    color: '#666',
    lineHeight: 16,
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
  detailContent: {
    flex: 1,
    alignItems: 'center',
    padding: 20,
  },
  detailPetImage: {
    width: 150,
    height: 150,
    borderRadius: 75,
    marginBottom: 20,
  },
  detailPetName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  detailPersonality: {
    fontSize: 16,
    color: '#1976D2',
    marginBottom: 10,
  },
  detailDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 30,
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
  detailImagePlaceholder: {
    width: 120,
    height: 120,
    backgroundColor: '#F0F0F0',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
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
    