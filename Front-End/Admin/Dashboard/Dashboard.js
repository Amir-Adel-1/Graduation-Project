/* ================================
   🔵 الرسم البياني — حالات الطلبات
==================================*/
const ordersChart = new Chart(document.getElementById("ordersChart"), {
  type: "doughnut",
  data: {
    labels: ["مقبول", "قيد المراجعة"],
    datasets: [{
      data: [240, 160],            // 🔥 قيمتين بس
      backgroundColor: [
        "#3B82F6",  // أزرق - مقبول
        "#F43F5E"   // وردي - قيد المراجعة
      ],
      borderWidth: 2,
      hoverOffset: 10
    }]
  },
  options: {
    plugins: {
      legend: {
        labels: {
          color: "#ffffff",
          font: {
            size: 16
          }
        }
      }
    }
  }
});













// =======================================================
// 🔵 Render Weekly Chart
// =======================================================

const dashboardData = {
    weeklyOrders: [12, 19, 8, 15, 22, 17, 25],
    weeklyLabels: ["السبت", "الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة"]
};


// =======================================================
// 🔵 Render Weekly Chart
// =======================================================

function renderWeeklyChart() {
    const ctx = document.getElementById("requestsChart").getContext("2d");

    new Chart(ctx, {
        type: "bar",
        data: {
            labels: dashboardData.weeklyLabels,
            datasets: [{
                label: "عدد الطلبات",
                data: dashboardData.weeklyOrders,
                borderWidth: 2,
                backgroundColor: [
                    "rgba(14,165,233,0.7)",
                    "rgba(59,130,246,0.7)",
                    "rgba(16,185,129,0.7)",
                    "rgba(249,115,22,0.7)",
                    "rgba(236,72,153,0.7)",
                    "rgba(139,92,246,0.7)",
                    "rgba(234,179,8,0.7)"
                ],
                borderColor: "rgba(30,41,59,1)",
                hoverBackgroundColor: "rgba(30,41,59,0.9)",
                borderRadius: 6
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { stepSize: 5 }
                }
            }
        }
    });
}

// Call Chart
renderWeeklyChart();








// ================================
// 🔵 عدّاد الأرقام في الكروت
// ================================

const counters = document.querySelectorAll(".data span");
const speed = 200; // كل ما الرقم يقل الحركة تبقى أسرع

counters.forEach(counter => {
  const updateCount = () => {
    const target = +counter.innerText; // الرقم النهائي
    let count = 0;

    const increment = Math.ceil(target / speed);

    const animate = () => {
      count += increment;

      if (count < target) {
        counter.innerText = count;
        requestAnimationFrame(animate);
      } else {
        counter.innerText = target; // يثبت الرقم النهائي
      }
    };

    animate();
  };

  updateCount();
});
