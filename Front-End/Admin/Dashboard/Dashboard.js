/* ================================
       🔵 الرسم البياني — حالات الطلبات
==================================*/
const ordersChart = new Chart(document.getElementById("ordersChart"), {
  type: "doughnut",
  data: {
    labels: ["مقبول", "قيد المراجعة", "مرفوض"],
    datasets: [{
      data: [240, 160, 82],
      backgroundColor: [
        "#3B82F6",  // أزرق - مقبول
        "#F43F5E",  // وردي - قيد المراجعة
        "#F59E0B"   // أصفر - مرفوض
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



/* ================================
   🔵 الرسم البياني — المستخدمين شهريًا
==================================*/
const usersChart = new Chart(document.getElementById("usersChart"), {
  type: "line",
  data: {
    labels: [
      "يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو",
      "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"
    ],
    datasets: [{
      label: "عدد المستخدمين",
      data: [80, 95, 120, 140, 160, 200, 230, 260, 300, 350, 400, 450],
      borderColor: "#3B82F6",
      borderWidth: 3,
      tension: 0.35,
      fill: false,
      pointRadius: 5,
      pointBackgroundColor: "#3B82F6"
    }]
  },
  options: {
    scales: {
      x: {
        ticks: {
          color: "#fff",
          font: {
            size: 13
          }
        }
      },
      y: {
        ticks: {
          color: "#fff",
          font: {
            size: 13
          }
        }
      }
    },
    plugins: {
      legend: {
        labels: {
          color: "#fff",
          font: {
            size: 14
          }
        }
      }
    }
  }
});

// =============================================











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
